var exports = module.exports = function EventHandler(bot, client) {
    var self = this;
    var handlers = {};

    this.setup = function () {
        client.on('message', function (message) {
            if (message.author) {
                if (client.user.id === message.author.id) {
                    return;
                }
            }

            var handlers = self.getHandlers('message');
            if (handlers !== null) {
                handlers.forEach(function (handler) {
                    handler(message);
                });
            }
        });
        
        client.on('messageDelete', function(message) {
            if (message.author) {
                if (client.user.id === message.author.id) {
                    return;
                }
            }

            var handlers = self.getHandlers('messageDelete');
            if (handlers !== null) {
                handlers.forEach(function (handler) {
                    handler(message);
                });
            }
        });
        
        client.on('messageUpdate', function(message, oldMessage) {
            if (message.author) {
                if (client.user.id === message.author.id) {
                    return;
                }
            }

            var handlers = self.getHandlers('messageUpdate');
            if (handlers !== null) {
                handlers.forEach(function (handler) {
                    handler(message, oldMessage);
                });
            }
        });
    }

    this.getHandlers = function (event) {
        if (handlers[event] !== undefined) {
            if (handlers[event] instanceof Array) {
                return handlers[event];
            } else {
                bot.warn("Non-array detected in Event callbacks");
            }
        }

        return null;
    }

    this.on = function (event, handler) {
        if (handlers[event] instanceof Array) {
            handlers[event].push(handler);
        } else {
            handlers[event] = [handler];
        }
    }

};