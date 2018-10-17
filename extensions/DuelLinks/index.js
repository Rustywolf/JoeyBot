const difflib = require('difflib');
const Extension = require('../../DJSBuddy').Extension;
const skills = require('./skills.json');

const MATCH_RATIO = 0.8;

module.exports = class DuelLinks extends Extension {

  constructor(buddy) {
    super(buddy, "DuelLinks");

    this.addCommand("skill", cmd => this.skillCmd(cmd));
    //this.addCommand("skills", cmd => this.skillsCmd(cmd));
  }

  onEnable() {}
  onDisable() {}

  skillCmd(cmd) {
    if (!cmd.hasArg(0)) {
      cmd.getChannel().send(`Usage: ${this.buddy.commands.getSymbol(cmd.getGuild())}skill <skillname>`);
      return;
    }

    let name = cmd.getArgString();
    var sequenceMatcher = new difflib.SequenceMatcher(null, "", "");
    sequenceMatcher.setSeq2(name.toLowerCase());

    var match = "";
    var mratio = 0;
    for (let key in skills) {
      sequenceMatcher.setSeq1(key.toLowerCase());
      var ratio = sequenceMatcher.ratio();
      if (ratio >= MATCH_RATIO && ratio > mratio) {
        match = key;
        mratio = ratio;
      }
    }

    if (match) {
      let footer = "The skill can be used by ";
      let length = skills[match].characters.length;
      for (let n = 0; n < length; n++) {
        let character = skills[match].characters[n];
        switch (n) {
          case length - 1:
            footer += `${character}`;
            break;

          case length - 2:
            footer += `${character} and `;
            break;

          default:
            footer += `${character}, `;
        }
      }

      let embed = {
        color: 0x40558B,
        author: {
          name: match,
          iconURL: "http://i.imgur.com/nKigv6X.png"
        },
        description: skills[match].text,
        footer: {
          text: footer
        }
      };

      cmd.getChannel().send({
        embed: embed
      });
    } else {
      cmd.getChannel().send(`Unable to find skill '${name}'`);
    }
  }

  skillsCmd(cmd) {
    if (!cmd.hasArg(0)) {
      cmd.getChannel().send(`Usage: ${this.buddy.commands.getSymbol(cmd.getGuild())}skills <character>`);
      return;
    }

    let name = cmd.getArgString();
    var sequenceMatcher = new difflib.SequenceMatcher(null, "", "");
    sequenceMatcher.setSeq2(name.toLowerCase());

    var match = "";
    var mratio = 0;
    for (let key in skills) {
      let chars = skills[key].characters;
      for (let character of chars) {
        sequenceMatcher.setSeq1(character.toLowerCase());
        var ratio = sequenceMatcher.ratio();
        if (ratio >= MATCH_RATIO && ratio > mratio) {
          match = character;
          mratio = ratio;
        }
      }
    }

    if (match) {
      let matchedSkills = [];
      for (let key in skills) {
        let skill = skills[key];
        if (skill.characters.indexOf(match) !== -1) {
          matchedSkills.push(key);
        }
      }

      let description = "";
      let length = matchedSkills.length;
      for (let n = 0; n < length; n++) {
        let skill = matchedSkills[n];
        switch (n) {
          case length - 1:
            description += `**${skill}**`;
            break;

          case length - 2:
            description += `**${skill}** and `;
            break;

          default:
            description += `**${skill}**, `;
        }
      }

      let embed = {
        color: 0x40558B,
        author: {
          name: `${match} can use the following skills\n`,
          iconURL: "http://i.imgur.com/nKigv6X.png"
        },
        description: description
      };

      cmd.getChannel().send({
        embed: embed
      });
    } else {
      cmd.getChannel().send(`Unable to find character '${name}'`);
    }
  }
}


/*
let table = $0;
data = {};

for (let y = 0; y < table.rows.length; y++) {
  let obj = { characters: [] };
  let row = table.rows[y];
  let cells = row.cells;

  let findCharacters = /<a(.*?)>(.*?)<\/a>/g;
  let replace = /<br>/g;
  let strip = /<(.*?)>/g;

  let result;
  while((result = findCharacters.exec(cells[2].innerHTML)) !== null) {
    obj.characters.push(result[2].trim());
  }

  let name = cells[0].innerHTML.replace(replace, "\n").replace(strip, "").trim();
  obj.text = cells[1].innerHTML.replace(replace, "\n").replace(strip, "").trim();
  data[name] = obj;
}

console.log(JSON.stringify(data)); */