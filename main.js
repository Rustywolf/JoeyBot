var fs = require('fs');

var Discord = require('discord.js');
var Winston = require('winston');

var CommandHandler = require('./handlers/CommandHandler.js');
var ConfigHandler = require('./handlers/ConfigHandler.js');
var EventHandler = require('./handlers/EventHandler.js');
var ExtensionHandler = require('./handlers/ExtensionHandler.js');

var JoeyBot = function () {
    var self = this;
    var config = null;
    var startup = Date.now();

    if (!fs.existsSync("./logs/")) {
        fs.mkdirSync("./logs/");
    }

    var logger = new(Winston.Logger)({
        transports: [
            new(Winston.transports.Console)(),
            new(Winston.transports.File)({
                json: false,
                filename: "./logs/" + Date.now() + ".log"
            })
        ]
    });

    var client = this.client = new Discord.Client({
        autoReconnect: true
    });

    // The most important handler
    var events = this.events = new EventHandler(this, client);
    // Other handlers
    var configs = this.configs = new ConfigHandler(this);
    var commands = this.commands = new CommandHandler(this);
    var extensions = this.extensions = new ExtensionHandler(this);

    this.setup = function () {
        process.on('uncaughtException', function (e) {
            self.exception("Uncaught Exception");
            self.exception(e);
        });

        events.setup();
        configs.setup();
        commands.setup();
        extensions.setup();

        config = configs.getSection("core");

        if (config.token) {
            client.login(config.token);
        } else {
            this.exception("No token provided!");
            process.exit(2);
        }
    }

    this.sendMessage = function (dest, message, options) {
        options = options || {};
        if (typeof dest['sendMessage'] === 'function') {
            return dest['sendMessage'](message, options);
        } else {
            this.warn("Attempting to sendMessage to non-destination");
        }
    }

    this.sendEmbed = function (dest, embed) {
        if (typeof dest['sendEmbed'] === 'function') {
            return dest['sendEmbed'](embed);
        } else {
            this.warn("Attempting to sendEmbed to non-destination");
        }
    }

    this.reply = function (dest, message, options) {
        options = options || {};
        if (typeof dest['reply'] === 'function') {
            return dest['reply'](message, options);
        } else {
            this.warn("Attempting to reply to non-destination");
        }
    }

    this.log = function (level, msg) {
        if (msg === undefined) {
            logger.info(level);
        } else {
            logger.log(level, msg);
        }
    }

    this.warn = function (msg) {
        logger.warn(msg);
    }

    this.exception = function (e) {
        logger.error(e);
    }

    this.exit = function (code) {
        process.exit(code || 0);
    }

    this.getUpTime = function () {
        return this.getTimeString(Date.now() - startup);
    }

    this.getTimeString = function(delta) {
        var ret = "";
        var d = delta = delta / 1000;

        if (delta > 3600) {
            var hours = Math.floor(d / 3600);
            d -= hours * 3600;
            ret += hours + "h ";
        }

        if (delta > 60) {
            var minutes = Math.floor(d / 60);
            d -= minutes * 60;
            ret += minutes + "m ";
        }

        ret += Math.floor(d) + "s";

        return ret;
    }
};

var bot = new JoeyBot();
bot.setup();