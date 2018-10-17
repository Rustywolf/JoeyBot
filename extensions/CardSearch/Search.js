const http = require('http');
const difflib = require('difflib');
const cheerio = require('cheerio');

let Card = require('./Card');

const URL = "yugioh.wikia.com";
const SEARCH = "/api/v1/Search/List?query=";
const SEARCH_LIMIT = "&limit=";

const IGNORE_REGEX = /(\((.*?)\)|^Card (.*?):|List of|^"(.*?)"$)/i
const MATCH_RATIO = 0.5;

function request(path) {
  let options = {
    host: URL,
    port: 80,
    path: path
  };

  return new Promise((resolve, reject) => {
    http.get(options, res => {
      if (res.statusCode != 200) {
        reject(new Error("Request (" + URL + path + ") responded with status code " + res.statusCode));
      } else {
        res.setEncoding("utf8");
        let body = "";

        res.on('data', chunk => {
          body += chunk;
        }).on('end', () => {
          resolve(body);
        }).on('error', e => {
          reject(e);
        });
      }
    });
  });
}

function searchRequest(name, limit) {
  return new Promise((resolve, reject) => {
    request(SEARCH + encodeURIComponent(name) + SEARCH_LIMIT + encodeURIComponent(limit)).then(body => {
      let data = JSON.parse(body);
      let sequenceMatcher = new difflib.SequenceMatcher(null, "", "");
      sequenceMatcher.setSeq2(name.toLowerCase());

      if (!data.items) {
        return;
      }

      let match = null;
      let mratio = 0;
      data.items.forEach((item) => {
        if (IGNORE_REGEX.test(item.title)) {
          return;
        }

        sequenceMatcher.setSeq1(item.title.toLowerCase());
        let ratio = sequenceMatcher.ratio();
        if (ratio >= MATCH_RATIO && ratio > mratio) {
          mratio = ratio;
          match = item;
        }
      });

      if (match !== null) {
        resolve(match);
      } else {
        reject(new Error("Unable to find match for " + name));
      }
    }).catch(e => {
      reject(e);
    });
  });
}

function parseCardData(name, url, options) {
  return new Promise((resolve, reject) => {
    let card = new Card(name, options);

    request(url).then(url => {
      let $ = cheerio.load(url);
      let table = $('.cardtable');

      if (!table.length) {
        reject(new Error("No cardtable found for page: " + url));
      }

      table.find('.cardtable-cardimage').each(function() {
        let row = $(this);
        card.parse("image", row.find('a.image').attr("href"));
      })

      table.find('.cardtablerow').each(function() {
        let row = $(this);
        card.parse(row.find('.cardtablerowheader').html(), row.find('.cardtablerowdata').html());
      });

      card.parse("text", table.find('.navbox-list').first().html().replace("<br>", "\n").trim());
      try {
        let date = "";
        $($(".card-list").first().find("tbody").first().find("tr").get().reverse()).each(function(i, f) {
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
        reject(e);
      }

      resolve(card);
    }).catch(e => {
      reject(e);
    });
  });
}

module.exports = function search(name, options) {
  return new Promise((resolve, reject) => {
    searchRequest(name, 5)
      .then(data => parseCardData(data.title, data.url, options))
      .then(card => resolve(card))
      .catch(e => reject(e));
  });
}