var domain = require('domain');

var exports = module.exports = function ExtensionHandler(bot) {
    var self = this;
    var config = null;
    var extensions = {};

    this.setup = function () {
        config = bot.configs.getSection("ext");
        var exts = config.list;

        try {
            for (var i = 0; i < exts.length; i++) {
                var key = exts[i];
                var rqr = require(".././extensions/" + key + "/main.js");
                var obj = new rqr(bot);
                extensions[key] = obj;
            }

            Object.keys(extensions).forEach(function (key) {
                var obj = extensions[key];
                obj.setup();
            });
        } catch (e) {
            bot.exception("Error loading Extensions");
            bot.exception(e);
            bot.exit(3);
        }
    }

};