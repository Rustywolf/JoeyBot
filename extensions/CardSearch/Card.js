var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

// Constants
const REGEX_STRIP = /(<(.*?)>)/g;
const SPELL_COLOUR = 0x1D9E74;
const TRAP_COLOUR = 0xBC5A84;
const MONSTER_COLOURS = {
  Link: 0x40558B,
  Fusion: 0xA086B7,
  Synchro: 0xCCCCCC,
  Xyz: 0x0,
  Ritual: 0x6699ff,
  Effect: 0xFF8B53,
  Normal: 0xFDE68A
};

const ATTR_URLS = {
  DARK: "http://i.imgur.com/slNEyVk.png",
  WIND: "http://i.imgur.com/iecrLfT.png",
  WATER: "http://i.imgur.com/OAhQgUw.png",
  LIGHT: "http://i.imgur.com/EZbrrQ5.png",
  FIRE: "http://i.imgur.com/6nGb4rf.png",
  EARTH: "http://i.imgur.com/r3jFsid.png",
  DIVINE: "http://i.imgur.com/GGInB3U.png"
};

const ICON_URLS = {
  Normal: "http://i.imgur.com/Q8a9IZN.png",
  Continuous: "http://i.imgur.com/0s3LFUC.png",
  Equip: "http://i.imgur.com/M4CsBYb.png",
  QuickPlay: "http://i.imgur.com/bv6OTZg.png",
  Field: "http://i.imgur.com/aUFrtm1.png",
  Ritual: "http://i.imgur.com/MYquQVC.png",
  Counter: "http://i.imgur.com/hVGUA9L.png"
};

const LINK_MARKERS = {
  "Top": "\u2191",
  "Bottom": "\u2193",
  "Left": "\u2190",
  "Right": "\u2192",
  "Top-Right": "\u2197",
  "Top-Left": "\u2196",
  "Bottom-Right": "\u2198",
  "Bottom-Left": "\u2199"
}

// Private methods
function strip(value) {
  if (value == undefined) {
    return "";
  }

  return entities.decode(value.replace(REGEX_STRIP, "").trim());
}


// Define exports
module.exports = class Card {
  constructor(name, options) {
    this.name = name;
    this.options = options || {};
    this.properties = {};

    this.output = {
      type: "rich",
      fields: []
    };
  }


  // Public methods
  parse(key, value) {
    key = strip(key);
    value = strip(value);

    if (this.options.filter) {
      var {
        key,
        value
      } = this.options.filter(key, value);
    }

    switch (key) {
      case "English":
        this.set("name", value);
        break;

      case "Card type":
        this.set("type", value);
        break;

      case "Date":
      case "Link Markers":
      case "image":
      case "text":
      case "Attribute":
      case "Type":
      case "Types":
      case "Level":
      case "Rank":
      case "Materials":
      case "Pendulum Scale":
      case "Property":
        if (key == "Types") {
          key = "Type";
        }

        this.set(key.toLowerCase(), value);
        break;

        // It's a monster
      case "ATK/DEF":
      case "ATK / DEF":
        let stats = value.split("/");
        this.set("attack", stats[0]);
        this.set("defense", stats[1]);
        this.set("monster", "true");
        break;

      case "ATK/LINK":
      case "ATK / LINK":
        let linkStats = value.split("/");
        this.set("attack", linkStats[0]);
        this.set("link", linkStats[1]);
        this.set("monster", true);
        break;
    }
  }

  set(key, value) {
    this.properties[key] = value;
  }

  get(key) {
    return this.properties[key];
  }

  has(key) {
    return this.properties[key] !== undefined;
  }

  isMonster() {
    return this.has("monster");
  }

  setImage() {
    if (this.has("image")) {
      this.output.thumbnail = {
        url: this.get("image"),
      };
    }
  }

  setColor() {
    if (this.isMonster()) {
      for (let key in MONSTER_COLOURS) {
        if (this.get("type").indexOf(key) != -1) {
          this.output.color = MONSTER_COLOURS[key];
          return;
        }
      }

      this.output.color = MONSTER_COLOURS.Normal;
    } else {
      if (this.get("type").indexOf("Spell") != -1) {
        this.output.color = SPELL_COLOUR;
      } else if (this.get("type").indexOf("Trap") != -1) {
        this.output.color = TRAP_COLOUR;
      }
    }
  }

  setAttribute() {
    if (this.isMonster()) {
      this.output.author = {
        name: this.get("name"),
        icon_url: ATTR_URLS[this.get("attribute")]
      };
    } else {
      this.output.author = {
        name: this.get("name"),
        icon_url: ICON_URLS[this.get("property").replace(/\-/g, "")]
      }
    }
  }

  createLinkMarkerText() {
    let arrows = "**Link**: " + this.get("link") + " ( ";
    let markers = this.get("link markers");
    markers.split(",").map(d => d.trim()).forEach(direction => {
      if (LINK_MARKERS[direction]) {
        arrows += "\\" + LINK_MARKERS[direction] + "  ";
      }
    });

    arrows = arrows.slice(0, -2) + " )\n";

    return arrows;
  }

  createLevelText() {
    let level = null;
    let level_val = 0;
    if (this.has("level")) {
      level = "Level";
      level_val = this.get("level");
    } else if (this.has("rank")) {
      level = "Rank";
      level_val = this.get("rank");
    }

    if (level != null) {
      return "**" + level + "**: " + level_val + "\n";
    } else {
      return "";
    }
  }

  createMonsterCardText() {
    let ret = "";

    let text = this.get("text");
    let monster_eff = null;
    let pend_eff = null;
    if (this.has("pendulum scale") && text.indexOf("Pendulum Effect\n") != -1) {
      let split = text.split("Monster Effect\n");
      monster_eff = split[1].trim();
      pend_eff = split[0].replace(/Pendulum Effect\n/g, "").trim();
    } else {
      monster_eff = text;
    }

    if (pend_eff != null) {
      ret += "\n**Pendulum Effect**\n" + pend_eff + "\n";
    }

    if (monster_eff != null) {
      if (pend_eff != null) {
        ret += "\n**Monster Effect**"
      }
      ret += "\n" + monster_eff + "\n\n";
    }

    return ret;
  }

  createStatText() {
    return "**ATK** " + this.get("attack") + (this.has("defense") ? "  **DEF** " + this.get("defense") : "") + "\n";
  }

  createTypeText() {
    return "**[** " + this.get("type").replace(/\//g, "**/**") + " **]**\n";
  }

  createScaleText() {
    return "**Scale**: " + this.get("pendulum scale") + "\n";;
  }

  render() {
    this.output = {
      type: "rich",
      fields: []
    };

    let type = this.options.type || "desc";

    this.setImage();
    this.setColor();
    this.setAttribute();

    if (this.isMonster()) {
      this.setAttribute();

      let desc = "";

      if (type === "desc") {
        if (this.has("link markers")) {
          desc += this.createLinkMarkerText();
        } else {
          desc += this.createLevelText();
        }

        desc += this.createTypeText();

        if (this.has("pendulum scale")) {
          desc += this.createScaleText();
        }

        desc += this.createMonsterCardText();
        desc += this.createStatText();
      } else if (type === "date") {
        if (this.has("date")) {
          desc += "This card was last printed **" + this.get("date") + "**";
        } else {
          desc += "Unable to determine last print date.";
        }
      }

      this.output.description = desc;
    } else {
      let desc = "";
      if (type === "desc") {
        desc = this.get("text");
      } else if (type === "date") {
        if (this.has("date")) {
          desc += "This card was last printed **" + this.get("date") + "**";
        } else {
          desc += "Unable to determine last print date.";
        }
      }

      this.output.description = desc;
    }

    return this.output;
  }
}