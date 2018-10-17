const Extension = require('../../DJSBuddy').Extension;
const Card = require('./Card');
const Response = require('./Response');
const search = require('./Search');

const MESSAGE_REGEX = /{([^{]*?)}/g;

module.exports = class CardSearch extends Extension {

  constructor(buddy) {
    super(buddy, "CardSearch");

    this.addCommand("psct", cmd => this.psctCmd(cmd));
    this.addCommand("date", cmd => this.dateCmd(cmd));
    this.on("message", msg => this.onMessage(msg));
  }

  onEnable() {}
  onDisable() {}

  psctCmd(cmd) {
    let cardName = cmd.getArgString();
    let response = new Response(this, 1, cmd.getChannel());

    search(cardName, {
        filter: (key, value) => {
          if (key === "text") {
            value = value.replace(/(You can only (activate|use) (this effect|each effect of|1) "(.*?)" (once )?per turn.)/gi, "***$1***")
            value = value.replace(/\:/g, "***:***");
            value = value.replace(/\;/g, "***;***");
            value = value.replace(/(^|\. ?)(if|when)/gi, "$1***$2***");
            value = value.replace(/, (then) /gi, ", ***$1*** ");
            value = value.replace(/ (and(, if you do)?)(,| )/gi, " ***$1***$3");
            value = value.replace(/ (also(, after that)?)(,| )/gi, " ***$1***$3");
            value = value.replace(/(target(s|ed|ing)?)/gi, "***$1***");
            value = value.replace(/((^|[^"] )once per turn)/gi, "***$1***");
            value = value.replace(/(during either player's ([^:]*))/gi, "***$1***");
            value = value.replace(/(you can)($|(?! only))/gi, "***$1***");
            value = value.replace(/\*{6}/g, "");
          }

          return {
            key: key,
            value: value
          };
        }
      })
      .then(card => response.handle(card))
      .catch(e => this.error(e));
  }

  dateCmd(cmd) {
    let cardName = cmd.getArgString();
    let response = new Response(this, 1, cmd.getChannel());

    search(cardName, {
        type: "date"
      })
      .then(card => response.handle(card))
      .catch(e => this.error(e));
  }

  onMessage(msg) {
    let result = "";
    let results = [];

    while ((result = MESSAGE_REGEX.exec(msg.content))) {
      results.push(result[1]);
    }

    // Filter out non-unique results
    results = results.filter(function(value, index, self) {
      return self.indexOf(value) === index;
    });

    let response = new Response(this, results.length, msg.channel);
    for (let cardName of results) {
      search(cardName)
        .then(card => response.handle(card))
        .catch(e => this.error(e));
    }
  }
}