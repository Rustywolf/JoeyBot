var exports = module.exports = function CommandHandler(bot) {
    var self = this;
    this.commands = {};
    this.commandRestrictions = {};

    this.setup = function () {
        this.commandRestrictions = bot.configs.getSection("core.commands.restrictions");
        bot.events.on('message', function (message) {
            if (!message.content) return;
            if (!message.guild) return;
            if (!message.channel) return;
            if (message.channel.type !== "text") return;

            var args = message.content.split(" ");
            var command = args.shift();

            self.handle(command, args, message);
        });

        this.add("!disable", function (args, message) {
            if (!message.author || message.author.id !== message.guild.ownerID) return;
            args.forEach(function (arg) {
                arg = arg.toLowerCase();
                switch (arg) {
                case "replay":
                case "unedit":
                case "skill":
                case "date":
                case "psct":
                case "lookup":
                    var guild = message.guild;
                    var id = guild.id;
                    var restrictions = self.commandRestrictions[id] = self.commandRestrictions[id] || {};
                    var disabled = restrictions.disabled = restrictions.disabled || [];
                    if (disabled.indexOf(arg) !== -1) {
                        disabled.splice(disabled.indexOf(arg), 1);
                        bot.sendMessage(message.channel, "Succesfully **enabled** " + arg);
                    } else {
                        disabled.push(arg);
                        bot.sendMessage(message.channel, "Succesfully **disabled** " + arg);
                    }
                    break;

                default:
                    bot.sendMessage(message.channel, "Unable to disable command **\"" + arg + "\"** (Unknown or Unavailable)");
                    break;
                }
            });
        });
    }

    this.add = function (command, callback) {
        this.commands[command] = callback;
    }

    this.handle = function (command, args, message) {
        if (this.commands[command]) {
            if (this.commandRestrictions[message.guild.id]) {
                if (this.commandRestrictions[message.guild.id].disabled) {
                    if (this.commandRestrictions[message.guild.id].disabled.indexOf(command.toLowerCase().substr(1)) !== -1) {
                        return;
                    }
                }
            }
            
            this.commands[command](args, message);
        }
    }
};