var ADMIN_ID = "96880206836424704";
var exports = module.exports = function Admin(bot) {
    this.setup = function () {
        bot.commands.add("!exit", function (args, message) {
            if (message.author.id === ADMIN_ID) {
                bot.exit(0);
            } else {
                bot.exception("Non-admin attempting to use admin command!");
            }
        });

        bot.commands.add("!count", function (args, message) {
            if (message.author.id !== ADMIN_ID) {
                bot.exception("Non-admin attempting to use admin command!");
                return;
            } else {
                bot.sendMessage(message.channel, "Server Count: **" + bot.client.guilds.size + "**");
            }
        });

        bot.commands.add("!usercount", function (args, message) {
            if (message.author.id !== ADMIN_ID) {
                bot.exception("Non-admin attempting to use admin command!");
                return;
            } else {
                var count = {};
                bot.client.guilds.forEach(function (guild) {
                    guild.members.forEach(function (member) {
                        if (!count[member.id]) count[member.id] = true;
                    });
                });
                bot.sendMessage(message.channel, "User Count: **" + Object.keys(count).length + "**");
            }
        });

        bot.commands.add("!pmowners", function (args, message) {
            if (message.author.id !== ADMIN_ID) {
                bot.exception("Non-admin attempting to use admin command!");
                return;
            } else {
                var message = args.join(" ");
                bot.client.guilds.forEach(function (guild) {
                    if (guild.owner) {
                        bot.sendMessage(guild.owner.user, message);
                    }
                });
            }
        });

        bot.commands.add("!remove", function (args, message) {
            if (message.author.id !== ADMIN_ID) {
                bot.exception("Non-admin attempting to use admin command!");
                return;
            } else {
                args.forEach(function (code) {
                    message.channel.fetchMessage(code).then(function (message) {
                        message.delete();
                    });
                });
            }
        });

        bot.commands.add("!uptime", function (args, message) {
            if (message.author.id !== ADMIN_ID) {
                bot.exception("Non-admin attempting to use admin command!");
                return;
            } else {
                bot.sendMessage(message.channel, "Current Uptime is **" + bot.getUpTime() + "**");
            }
        });
    }
};