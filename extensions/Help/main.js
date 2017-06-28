var Discord = require('discord.js');

var exports = module.exports = function HelpHandler(bot) {
    var self = this;

    this.setup = function () {
        bot.commands.add("!help", function (args, message) {
            bot.sendEmbed(message.channel, self.formatMenu());
        });

        bot.commands.add("!about", function (args, message) {
            bot.sendEmbed(message.channel, self.formatAbout());
        });
    }

    //**!lookup <en|jp> <card name> - Displays a card in the given language (Support for other languages to be added in the future)
    this.formatMenu = function () {
        var embed = new Discord.RichEmbed();
        embed.setAuthor("Help");
        embed.setColor(0x40558B);
        embed.setDescription(
            `
__Card Search__
To search for a card, surround a card name with '{' and '}' (i.e. **{Pot of Greed}**)

**!date <card name>** - Searches the latest printing date of the given card
**!psct <card name>** - Highlights PSCT keywords for a given card (Experimental)

__Duel Links__
**!skill <skill name>** - Displays description of <skill name>

__General__
**!disable <command>** - Disables command for current server (i.e. "!disable replay")
*Note: Card Searching ({Pot of Greed}), !help and !about cannot be disabled*
**!replay** - Posts the last deleted message in the current channel
**!unedit** - Displays the original message content for the previous edited message
**!help** - Lists current commands
**!about** - More information about JoeyBot
`
        );
        return embed;
    }
    
    this.formatAbout = function() {
     var embed = new Discord.RichEmbed();
        embed.setAuthor("About");
        embed.setColor(0x40558B);
        embed.setDescription(
            `
JoeyBot V3 - Created by Rustywolf (/u/Rustywolf, Rusty#4765)
Github - https://github.com/Rustywolf/JoeyBotV3

JoeyBot is free to use, and available to any server. Send me a PM to add him to your server.
`);
        
        return embed;
    }
};