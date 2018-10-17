module.exports = class Response {
  constructor(extension, count, destination, onError) {
    this.extension = extension;
    this.destination = destination;
    this.cardCount = count;
    this.onError = onError;

    this.processed = 0;
    this.embeds = [];
    this.lastSentEmbed = 0;
  }

  handleError(e, card) {
    if (this.onError) {
      this.onError(e);
    } else {
      this.extension.error(e);
      this.extension.error("Exception while processing card: " + card.name);
    }
  }

  sendNext() {
    let curr = this.embeds[this.lastSentEmbed++];
    let promise = (typeof this.destination === "function") ?
      this.destination(curr.embed) :
      this.destination.send({
        embed: curr.embed
      });

    promise.then(() => {
      if (this.lastSentEmbed < this.embeds.length) {
        this.sendNext();
      }
    }).catch(e => {
      this.handleError(e, curr.card);
    });
  }

  handle(card) {
    this.processed++;
    try {
      this.embeds.push({
        card: card,
        embed: card.render()
      });
    } catch (e) {
      this.handleError(e, card);
    }

    if (this.processed >= this.cardCount && this.embeds.length > 0) {
      this.sendNext();
    }
  }
}