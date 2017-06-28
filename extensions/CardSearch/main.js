var Card = require('./Card.js');
var Database = require('./Database.js');
var Response = require('./Response.js');

var MESSAGE_REGEX = /{([^{]*?)}/g;

var exports = module.exports = function CardSearch(bot) {
    var self = this;
    var config = null;

    this.setup = function () {
        config = bot.configs.getSection("ext.cardsearch");

        bot.commands.add("!psct", function (args, message) {
            var cardName = args.join(" ");
            bot.log("Processing (PSCT): " + cardName + " <" + message.guild.name + ":" + message.guild.id + ":" + message.author.username + ">");
            var response = new Response(bot, function (embed) {
                embed.footer = {
                    text: "This feature is still experimental. If you notice an error, please contact Rusty."
                };
                bot.sendMessage(message.channel, "", {
                    embed: embed
                });
            }, 1);

            (new Database(bot)).search(cardName, function (card) {
                response.handle(card);
            }, {
                filter: function (key, value) {
                    if (key === "text") {
                        value = value.replace(/(You can only (activate|use) (this effect|each effect of|1) "(.*?)" (once )?per turn.)/gi, "***$1***")
                        value = value.replace(/\:/g, "***:***");
                        value = value.replace(/\;/g, "***;***");
                        value = value.replace(/(^|\. ?)(if|when)/gi, "$1***$2***");
                        value = value.replace(/, (then) /gi, ", ***$1*** ");
                        value = value.replace(/ (and(, if you do)?)(,| )/gi, " ***$1***$3");
                        value = value.replace(/ (also(, after that)?)(,| )/gi, " ***$1***$3");
                        value = value.replace(/(target(s|ed|ing)?)/gi, "***$1***");
                        value = value.replace(/((^|[^"] )once per turn)/gi, "***$1***");
                        value = value.replace(/(during either player's ([^:]*))/gi, "***$1***");
                        value = value.replace(/(you can)($|(?! only))/gi, "***$1***");
                        value = value.replace(/\*{6}/g, "");
                    }

                    return {
                        key: key,
                        value: value
                    };
                }
            });
        });

        bot.commands.add("!date", function (args, message) {
            var cardName = args.join(" ");
            bot.log("Processing (DATE): " + cardName + " <" + message.guild.name + ":" + message.guild.id + ":" + message.author.username + ">");
            var response = new Response(bot, function (embed) {
                bot.sendMessage(message.channel, "", {
                    embed: embed
                });
            }, 1);

            (new Database(bot)).search(cardName, function (card) {
                response.handle(card);
            }, {
                type: "date"
            });
        });

        bot.events.on('message', function (message) {
            var result = "";
            var results = [];

            while ((result = MESSAGE_REGEX.exec(message.content))) {
                results.push(result);
            }

            // Filter out non-unique results
            results = results.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });

            var response = new Response(bot, function (embed) {
                bot.sendMessage(message.channel, "", {
                    embed: embed
                });
            }, results.length);

            var database = new Database(bot);
            results.forEach(function (val) {
                var cardName = val[1];
                bot.log("Processing: " + cardName + " <" + message.guild.name + ":" + message.guild.id + ":" + message.author.username + ">");
                database.search(cardName, function (card) {
                    response.handle(card);
                });
            });
        });
    }

};