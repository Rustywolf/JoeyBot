var http = require('http');
var difflib = require('difflib');
var cheerio = require('cheerio');

var Card = require('./Card.js');

const URL = "yugioh.wikia.com";
const SEARCH = "/api/v1/Search/List?query=";
const SEARCH_LIMIT = "&limit=";

const IGNORE_REGEX = /(\((.*?)\)|^Card (.*?):|List of|^"(.*?)"$)/i

const MATCH_RATIO = 0.5;

var exports = module.exports = function Database(bot) {

    function request(path, callback) {
        var options = {
            host: URL,
            port: 80,
            path: path,
        };

        http.get(options, function (res) {
            if (res.statusCode != 200) {
                callback(null, new Error("Request (" + URL + path + ") responded with status code " + res.statusCode));
            } else {
                res.setEncoding('utf8');

                var body = '';

                res.on('data', function (chunk) {
                    body += chunk;
                }).on('end', function () {
                    callback(body);
                }).on('error', function (e) {
                    callback(null, e);
                });
            }
        });
    }

    function search(name, limit, callback) {
        request(SEARCH + encodeURIComponent(name) + SEARCH_LIMIT + encodeURIComponent(limit), function (res, e) {
            if (e) {
                bot.exception(e);
            } else {
                var data = JSON.parse(res);
                var sequenceMatcher = new difflib.SequenceMatcher(null, "", "");
                sequenceMatcher.setSeq2(name.toLowerCase());

                if (!data.items) {
                    return;
                }

                var match = null;
                var mratio = 0;
                data.items.forEach(function (item) {
                    if (IGNORE_REGEX.test(item.title)) {
                        return;
                    }

                    sequenceMatcher.setSeq1(item.title.toLowerCase());
                    var ratio = sequenceMatcher.ratio();
                    if (ratio >= MATCH_RATIO && ratio > mratio) {
                        mratio = ratio;
                        match = item;
                    }
                });

                if (match !== null) callback(match);
            }
        });
    }

    function parseCardData(url, callback, options) {
        var card = new Card(options);

        request(url, function (res, e) {
            if (e) {
                bot.exception(e);
            } else {
                var $ = cheerio.load(res);
                var table = $('.cardtable');

                if (!table.length) {
                    bot.warn("No cardtable found for page: " + url);
                    return;
                }

                table.find('.cardtable-cardimage').each(function () {
                    var row = $(this);
                    card.parse("image", row.find('a.image').attr("href"));
                })

                table.find('.cardtablerow').each(function () {
                    var row = $(this);
                    card.parse(row.find('.cardtablerowheader').html(), row.find('.cardtablerowdata').html());
                });

                card.parse("text", table.find('.navbox-list').first().html().replace("<br>", "\n").trim());
                try {
                    var date = "";
                    $($(".card-list").first().find("tbody").first().find("tr").get().reverse()).each(function (i, f) {
                        if (date === "") {
                            date = $(this).find("td").first().html();
                            date = date || "";
                            date = date.trim();
                            if (date !== "") {
                                card.parse("Date", date);
                            }
                        }
                    });
                } catch (e) {
                    bot.exception(e);
                }

                callback(card);

            }
        });

    }

    this.search = function (name, callback, options) {
        search(name, 5, function (data) {
            parseCardData(data.url, callback, options);
        });
    }
}