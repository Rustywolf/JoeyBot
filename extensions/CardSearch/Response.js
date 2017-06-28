var exports = module.exports = function Response(bot, send, count) {
    this.send = send;

    this.cardCount = count;
    this.processed = 0;
    this.sucessful = 0;
    this.embeded = [];

    this.handle = function (card) {
        this.processed++;
        try {
            this.embeded.push(card.format());
            this.sucessful++;
        } catch (e) {
            bot.exception(e);
        }
        
        if (this.processed == this.cardCount && this.sucessful > 0) {
            this.embeded.forEach(function(embed, index) {
                setTimeout(function() {
                    send(embed);
                }, index * 200);
            });
        }
    }
};
