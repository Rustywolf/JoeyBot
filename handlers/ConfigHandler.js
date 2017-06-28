var fs = require('fs');

var exports = module.exports = function ConfigHandler(bot) {
    var self = this;
    var config = {};

    this.setup = function () {
        this.load();
        setInterval(this.save, 60*1000);
    }

    this.load = function () {
        try {
            config = JSON.parse(fs.readFileSync('./config.json'));
        } catch (e) {
            if (e.code === "ENOENT") {
                bot.log("No config found, creating...");
                this.save();
            } else {
                bot.exception(e);
                bot.exit(1);
            }
        }
    }

    this.save = function () {
        try {
            fs.writeFile('./config.json', JSON.stringify(config, null, 4));
        } catch (e) {
            bot.exception(e);
            bot.exit(2);
        }
    }

    this.getSection = function (path) {
        var parts = path.split(".");
        var cfg = config;
        var created = false;
        for (var i = 0; i < parts.length; i++) {
            if (cfg[parts[i]] === undefined) {
                bot.warn("Requesting unknown ConfigSection");
                cfg[parts[i]] = {};
                created = true;
            }

            if (cfg[parts[i]] instanceof Object) {
                cfg = cfg[parts[i]];
            } else {
                throw new Error("Requesting path through non-object");
            }
        }

        if (created) {
            this.save();
        }
        
        return cfg;
        //return new Proxy(cfg, ConfigProxyController);
    }

    var ConfigProxyController = {
        get: function (target, key) {
            if (target[key] !== null && typeof target[key] === 'object') {
                return new Proxy(target[key], ConfigProxyController);
            } else {
                return target[key];
            }
        },

        set: function (target, key, value) {
            target[key] = value;
            return true;
        }
    }
};