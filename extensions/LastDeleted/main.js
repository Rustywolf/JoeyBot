var Discord = require('discord.js');

var exports = module.exports = function LastDeleted(bot) {
    var lastMessage = {};
    var lastUpdate = {};
    
    this.setup = function () {
        bot.events.on('messageDelete', function (message) {
            if (message && message.author) {
                last = {
                    author: message.author,
                    message: message.content,
                    time: Date.now()
                };
                lastMessage[message.channel.id] = last;
            }
        });
        
        bot.events.on('messageUpdate', function (message, newMessage) {
            if (message && message.author && message.channel) {
                update = {
                    author: message.author,
                    message: message.content,
                    time: Date.now()
                };
                lastUpdate[message.channel.id] = update;
            }
        });
        
        bot.commands.add("!replay", function (args, message) {
            if (message.channel && lastMessage[message.channel.id] != undefined) {
                var last = lastMessage[message.channel.id];
                var delta = Date.now() - last.time;
                var timeString = bot.getTimeString(delta);

                var embed = new Discord.RichEmbed();
                embed.setAuthor(last.author.username, last.author.displayAvatarURL);
                embed.setColor(0xFF0000);
                embed.setDescription(last.message);
                embed.setFooter("Message deleted " + timeString + " ago");

                bot.sendEmbed(message.channel, embed);
            }
        });
        
        bot.commands.add("!unedit", function (args, message) {
            if (message.channel && lastUpdate[message.channel.id] != undefined) {
                var update = lastUpdate[message.channel.id];
                var delta = Date.now() - update.time;
                var timeString = bot.getTimeString(delta);

                var embed = new Discord.RichEmbed();
                embed.setAuthor(update.author.username, update.author.displayAvatarURL);
                embed.setColor(0xFF9900);
                embed.setDescription(update.message);
                embed.setFooter("Message edited " + timeString + " ago");

                bot.sendEmbed(message.channel, embed);
            }
        });
        
        bot.commands.add("!shitpost", function (args, message) {
            if (message.author && message.author.id == "96880206836424704") {
                bot.sendMessage(message.channel, "\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40 good shit go\u0C66\u0501 sHit\uD83D\uDC4C thats \u2714 some good\uD83D\uDC4C\uD83D\uDC4Cshit right\uD83D\uDC4C\uD83D\uDC4Cthere\uD83D\uDC4C\uD83D\uDC4C\uD83D\uDC4C right\u2714there \u2714\u2714if i do \u01BDa\u04AF so my self \uD83D\uDCAF i say so \uD83D\uDCAF thats what im talking about right there right there (chorus: \u02B3\u1DA6\u1D4D\u02B0\u1D57 \u1D57\u02B0\u1D49\u02B3\u1D49) mMMMM\u13B7\u041C\uD83D\uDCAF \uD83D\uDC4C\uD83D\uDC4C \uD83D\uDC4C\u041DO0\u041E\u0B20OOOOO\u041E\u0B20\u0B20Oooo\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\uD83D\uDC4C \uD83D\uDC4C\uD83D\uDC4C \uD83D\uDC4C \uD83D\uDCAF \uD83D\uDC4C \uD83D\uDC40 \uD83D\uDC40 \uD83D\uDC40 \uD83D\uDC4C\uD83D\uDC4CGood shit");
            }
        });
    }
};