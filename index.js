const DJSBuddy = require('DJSBuddy');

const CardSearch = require('./extensions/CardSearch');
const HistoryCommands = require('./extensions/HistoryCommands');
const RedditCommands = require('./extensions/RedditCommands');
const DuelLinks = require('./extensions/DuelLinks');

DJSBuddy.create({
  adminId: "96880206836424704"
}).then((buddy) => {

  // Extensions
  buddy.extensions.register(new CardSearch(buddy));
  buddy.extensions.register(new HistoryCommands(buddy));
  buddy.extensions.register(new RedditCommands(buddy));
  buddy.extensions.register(new DuelLinks(buddy));

  // Help
  let help = buddy.extensions.get("HelpCommands");

  help.setAboutText(["JoeyBot - Created by Rustywolf (/u/Rustywolf, Rusty#4765)", "Github - https://github.com/RustyDawson/JoeyBot", "", "JoeyBot is free to use, and available to any server. Join https://discord.gg/N9CFUc6 to learn more."].join("\n"));

  help.addHelpCategory("Card Search", "To search for a card, surround a card name with '{' and '}' (i.e. **{Pot of Greed}**)", "", "**!date <cardname>** - Searches the latest printing date of <cardname>", "**!psct <cardname>** - Highlights PSCT keywords for <cardname>");

  help.addHelpCategory("Duel Links", "**!skill <skillname>** - Displays description of <skill name>"); //, "**!skills <character>** - Displays skills that can be used <character>",);

  help.addHelpCategory("History", "**!replay** - Displays last deleted message", "**!unedit** - Displays the original version of the last edited message");

  help.color = 0xDF7E00;

  // Login
  buddy.login("Bot MTc2NzUzMTk2MTk3MjE2MjU3.Cgklvg.aN0BoQTLrrNotk8AbersrmiN0Qs");
}).catch((e) => {
  console.log(e);
});