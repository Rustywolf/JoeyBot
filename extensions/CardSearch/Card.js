var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

// Define exports
var exports = module.exports = function Card(options) {
    this.options = options || {};
    this.properties = {};
}

// Constants
const REGEX_STRIP = /(<(.*?)>)/g
const MONSTER_COLOURS = {
    Link: 0x40558B,
    Fusion: 0xA086B7,
    Synchro: 0xCCCCCC,
    Xyz: 0x0,
    Ritual: 0x6699ff,
    Effect: 0xFF8B53,
    Normal: 0xFDE68A
};
const SPELL_COLOUR = 0x1D9E74;
const TRAP_COLOUR = 0xBC5A84;

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

// Public methods
exports.prototype.parse = function (key, value) {
    key = strip(key);
    value = strip(value);

    if (this.options.filter) {
        var {
            key, value
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
        vals = value.split("/");
        this.set("attack", vals[0]);
        this.set("defense", vals[1]);
        this.set("monster", "true");
        break;

    case "ATK/LINK":
    case "ATK / LINK":
        vals = value.split("/");
        this.set("attack", vals[0]);
        this.set("link", vals[1]);
        this.set("monster", true);
        break;
    }
}

exports.prototype.set = function (key, value) {
    this.properties[key] = value;
}

exports.prototype.get = function (key) {
    return this.properties[key];
}

exports.prototype.has = function (key) {
    return this.properties[key] !== undefined;
}

exports.prototype.format = function () {
    var output = {
        type: "rich",
        fields: []
    };

    var type = this.options.type || "desc";

    if (this.has("image")) {
        output.thumbnail = {
            url: this.get("image"),
        };
    }

    if (this.has("monster")) {
        var color = null;
        Object.keys(MONSTER_COLOURS).some(key => {
            if (this.get("type").indexOf(key) != -1) {
                color = MONSTER_COLOURS[key];
                return true;
            }

            return false;
        });

        if (color == null) {
            color = MONSTER_COLOURS.Normal;
        }

        output.color = color;

        output.author = {
            name: this.get("name"),
            icon_url: ATTR_URLS[this.get("attribute")]
        };

        var desc = "";

        if (type === "desc") {
            if (this.has("link markers")) {
                var arrows = "**Link**: " + this.get("link") + " ( ";
                var markers = this.get("link markers");
                markers.split(",").forEach(function (direction) {
                    direction = direction.trim();
                    if (LINK_MARKERS[direction]) {
                        arrows += "\\" + LINK_MARKERS[direction] + "  ";
                    }
                });

                arrows = arrows.slice(0, -2) + " )\n";

                desc += arrows;
            } else {
                var level = null;
                var level_val = 0;
                if (this.has("level")) {
                    level = "Level";
                    level_val = this.get("level");
                } else if (this.has("rank")) {
                    level = "Rank";
                    level_val = this.get("rank");
                }

                if (level != null) {
                    desc += "**" + level + "**: " + level_val + "\n";
                }
            }

            desc += "**[** " + this.get("type").replace(/\//g, "**/**") + " **]**\n";

            if (this.has("pendulum scale")) {
                desc += "**Scale**: " + this.get("pendulum scale") + "\n";
            }

            var text = this.get("text");
            var monster_eff = null;
            var pend_eff = null;
            if (this.has("pendulum scale") && text.indexOf("Pendulum Effect\n") != -1) {
                var split = text.split("Monster Effect\n");
                monster_eff = split[1].trim();
                pend_eff = split[0].replace(/Pendulum Effect\n/g, "").trim();
            } else {
                monster_eff = text;
            }

            if (pend_eff != null) {
                desc += "\n**Pendulum Effect**\n" + pend_eff + "\n";
            }

            if (monster_eff != null) {
                if (pend_eff != null) {
                    desc += "\n**Monster Effect**"
                }
                desc += "\n" + monster_eff + "\n\n";
            }

            desc += "**ATK** " + this.get("attack") + (this.has("defense") ? "  **DEF** " + this.get("defense") : "") + "\n";
        } else if (type === "date") {
            if (this.has("date")) {
                desc += "This card was last printed **" + this.get("date") + "**";
            } else {
                desc += "Unable to determine last print date.";
            }
        }

        output.description = desc;
    } else {
        if (this.get("type").indexOf("Spell") != -1) {
            output.color = SPELL_COLOUR;
        } else if (this.get("type").indexOf("Trap") != -1) {
            output.color = TRAP_COLOUR;
        }

        output.author = {
            name: this.get("name"),
            icon_url: ICON_URLS[this.get("property").replace(/\-/g, "")]
        }

        var desc = "";
        if (type === "desc") {
            desc = this.get("text");
        } else if (type === "date") {
            if (this.has("date")) {
                desc += "This card was last printed **" + this.get("date") + "**";
            } else {
                desc += "Unable to determine last print date.";
            }
        }

        output.description = desc;
    }

    return output;
}