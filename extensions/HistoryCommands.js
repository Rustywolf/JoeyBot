const Discord = require('discord.js');
const Extension = require('../../DJSBuddy').Extension;
const getTimeString = require('../../DJSBuddy').TimeUtil.getTimeString;

module.exports = class HistoryCommands extends Extension {

  constructor(buddy) {
    super(buddy, "HistoryCommands");

    this.on('messageDelete', msg => this.onMessageDelete(msg));
    this.addCommand("replay", cmd => this.replayCmd(cmd), {
      type: "text"
    });

    this.on('messageUpdate', (oldMsg, newMsg) => this.onMessageUpdate(oldMsg, newMsg));
    this.addCommand("unedit", cmd => this.uneditCmd(cmd), {
      type: "text"
    });

    this.lastMessage = {};
    this.lastUpdate = {};
  }

  onEnable() {}
  onDisable() {
    this.lastMessage = {};
    this.lastUpdate = {};
  }

  replayCmd(cmd) {
    if (!this.lastMessage[cmd.getChannel().id]) {
      return;
    }

    let last = this.lastMessage[cmd.getChannel().id];
    let delta = Date.now() - last.time;
    let timeString = getTimeString(delta);

    var embed = new Discord.RichEmbed();
    embed.setAuthor(last.name, last.avatar);
    embed.setColor(0xFF0000);
    embed.setDescription(last.content);
    embed.setFooter("Message deleted " + timeString + " ago");

    cmd.getChannel().send({
      embed: embed
    });
  }

  onMessageDelete(msg) {
    if (!msg.guild || !msg.channel || !msg.member || msg.author.bot || !msg.content) {
      return;
    }

    this.lastMessage[msg.channel.id] = {
      name: msg.member.displayName,
      avatar: msg.author.displayAvatarURL(),
      content: msg.content,
      time: Date.now()
    };
  }

  uneditCmd(cmd) {
    if (!this.lastUpdate[cmd.getChannel().id]) {
      return;
    }

    let last = this.lastUpdate[cmd.getChannel().id];
    let delta = Date.now() - last.time;
    let timeString = getTimeString(delta);

    var embed = new Discord.RichEmbed();
    embed.setAuthor(last.name, last.avatar);
    embed.setColor(0xFF0000);
    embed.setDescription(last.content);
    embed.setFooter("Message edited " + timeString + " ago");

    cmd.getChannel().send({
      embed: embed
    });
  }

  onMessageUpdate(msg, newMsg) {
    if (!msg.guild || !msg.channel || !msg.member || msg.author.bot || !msg.content) {
      return;
    }

    this.lastUpdate[msg.channel.id] = {
      name: msg.member.displayName,
      avatar: msg.author.displayAvatarURL(),
      content: msg.content,
      time: Date.now()
    };
  }

}