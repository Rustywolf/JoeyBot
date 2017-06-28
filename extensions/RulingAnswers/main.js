var https = require("https");
var Reddit = require("raw.js");

var exports = module.exports = function RulingAnswers(bot) {
    var reddit = new Reddit("RegionBlockBot v1.0.1 by /u/Rustywolf");
    var discordId = "95620328654376960"; //"95620328654376960";
    var password = "_`HS-W<'5PCjk5/3";
    var authenticated = false;
    var requestUsers = [];

    function authenticate() {
        reddit.setupOAuth2("9ol1ZUQ8eQuKpg", "ztGKHqMrN1ST4BJaRfYfexMbI7k");
        reddit.auth({
            username: "RegionBlockBot",
            password: password
        }, function (err, response) {
            if (err) {
                bot.warn("Unable to authenticate Reddit!");
                setTimeout(authenticate, 1000 * 30);
            } else {
                bot.log("Authenticated!");
                authenticated = true;
                if (requestUsers.length != 0) {
                    processPosts();
                }
            }
        });
    }

    this.setup = function () {
        authenticate();
        bot.commands.add("!rulingscount", function (args, message) {
            if (message.channel && message.channel.guild && message.channel.guild.id == discordId) {
                if (args.length > 0) {
                    var request = {
                        author: message.author,
                        channel: message.channel,
                        user: args[0]
                    };
                    bot.sendMessage(message.channel, "Adding " + args[0] + " to queue!");
                    var process = requestUsers.length == 0;
                    requestUsers.push(request);
                    if (process) {
                        processPosts();
                    }
                } else {
                    bot.sendMessage(message.channel, "Please specify a user");
                }
            }
        });
    };

    function processPosts() {
        var posts = [];
        var interval = -1;
        var request = requestUsers.shift();
        var processed = false;
        var processMsg = "Processing " + request.user + " - Page #";
        var compilingMsg = "Compiling Data for " + request.user + " - ";
        var promise = bot.sendMessage(request.channel, "Processing " + request.user);
        promise.then(function (message) {
            var callback = (function () {
                var count = 0;
                var last = "";
                return function () {
                    bot.log("Retrieving page #" + count / 100);
                    message.edit(processMsg + ((count / 100) + 1));
                    reddit.userComments({
                        user: request.user,
                        count: count,
                        after: last,
                        limit: 100
                    }, function (e, response) {
                        if (e) {
                            bot.exception(e);
                        } else {
                            bot.log(response);
                            response.children.forEach(function (child) {
                                var data = child.data;
                                if (data.parent_id !== data.link_id && (data.link_title.indexOf("Ruling Megathread") != -1 || data.link_title.indexOf("Basic and Newbie Q&A Thread") != -1 || data.link_title.indexOf("Rulings Q&A Thread") != -1)) {
                                    posts.push({
                                        articleId: data.link_id.split("_")[1],
                                        parentId: data.parent_id.split("_")[1],
                                        commentId: data.id,
                                        url: data.link_url
                                    });
                                }
                                last = data.name;
                            });
                            if (response.children.length < 100 || count >= 25000 && !processed) {
                                processed = true;
                                clearInterval(interval);

                                message.edit(compilingMsg + "0%");
                                var postsLength = posts.length;
                                var processedCount = 0;
                                var results = [];
                                posts.forEach(function (post, index) {
                                    setTimeout(function () {
                                        var url = `https://www.reddit.com/r/yugioh/comments/${post.articleId}.json?comment=${post.parentId}&limit=1`;
                                        https.get(url, function (res) {
                                            var body = "";
                                            res.on("data", function (data) {
                                                body += data;
                                            });
                                            res.on("end", function () {
                                                if (body.charAt(0) == "<") {
                                                   bot.warn("Error processing " + url);
                                                } else {
                                                    message.edit(compilingMsg + (++processedCount / postsLength) * 100 + "%");
                                                    var response = JSON.parse(body);
                                                    response.forEach(function (comment) {
                                                        var data = comment.data.children[0].data;
                                                        if (data.id === post.parentId) {
                                                            if (data.parent_id === data.link_id) {
                                                                results.push("" + post.url + post.commentId);
                                                            }
                                                            if (processedCount >= posts.length) {
                                                                message.edit(compilingMsg + "100%");
                                                                printResults(request, results);
                                                                if (requestUsers.length != 0) {
                                                                    processPosts();
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                        }).on("error", function (e) {
                                            bot.exception(e);
                                        });
                                    }, 2000 * index);
                                });
                            }
                        }
                    });
                    count += 100;
                }
            })();
            interval = setInterval(callback, 1000);
            callback();
        });
    }

    function printResults(request, results) {
        var msgs = [];
        var msg = "Count: **" + results.length + "**\n";
        results.forEach(function (result) {
            if (msg.length + result.length > 1950) {
                msgs.push(msg);
                msg = result;
            } else {
                msg += result + "?context=2\n";
            }
        });
        msgs.push(msg);
        bot.sendMessage(request.channel, request.author);
        msgs.forEach(function (msg, index) {
            setTimeout(function () {
                bot.sendMessage(request.channel, msg);
            }, 250 * index);
        });
    }
};