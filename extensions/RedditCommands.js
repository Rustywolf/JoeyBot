const https = require("https");
const Reddit = require("raw.js");
const Extension = require('../../DJSBuddy').Extension;

const VALID_THREAD_TITLES = [
  "Ruling Megathread",
  "Basic and Newbie Q&A Thread",
  "Rulings Q&A Thread"
]

module.exports = class RedditCommands extends Extension {
  constructor(buddy) {
    super(buddy, "RedditCommands");

    this.reddit = new Reddit("RegionBlockBot v1.0.1 by /u/Rustywolf");
    this.redditUsername = "RegionBlockBot";
    this.redditPassword = "_`HS-W<'5PCjk5/3";
    this.redditBotId = "9ol1ZUQ8eQuKpg";
    this.redditBotSecret = "ztGKHqMrN1ST4BJaRfYfexMbI7k";

    this.redditModDiscordId = "95620328654376960";
    this.redditModDiscordTest = (cmd) => cmd.isGuildMessage() && cmd.getGuild().id === this.redditModDiscordId;

    this.authenticated = false;
    this.queuedRequests = [];

    this.addCommand("rulingscount", cmd => {
      if (!cmd.hasArg(0)) {
        cmd.getChannel().send(`Usage: ${this.buddy.commands.getSymbol(cmd.getGuild())}rulingscount <username>`);
        return;
      }

      let request = {
        author: cmd.getAuthor(),
        channel: cmd.getChannel(),
        user: cmd.getArg(0)
      };

      cmd.getChannel().send(`Adding ${request.user} to queue!`);
      this.queuedRequests.push(request);
      if (this.queuedRequests.length == 1) {
        this.processNextRequest();
      }
    }, {
      test: this.redditModDiscordTest
    });
  }

  onEnable() {
    this.reddit.setupOAuth2(this.redditBotId, this.redditBotSecret);
    this.reddit.auth({
      username: this.redditUsername,
      password: this.redditPassword
    }, (e, res) => {
      if (e) {
        this.error(e, "Unable to authenticate Reddit API");
        this.disable();
        return;
      }

      this.authenticated = true;
      this.info("Reddit has authenticated");
      if (this.queuedRequests.length > 0) {
        this.processNextRequest();
      }
    });
  }

  onDisable() {
    this.reddit.logout();
  }

  processNextRequest() {
    let request = this.queuedRequests.shift();

    let processText = (percentage) => `Processing ${request.user}: **${Math.floor(percentage*100)}%**`;
    let processPromise = request.channel.send(processText(0));

    processPromise.then(msg => {
      let processMessage = msg;
      let count = 0;
      let posts = [];
      let results = [];
      let lastId = "";

      let intervalId = -1;

      let callback = () => {
        processMessage.edit(processText((count / 25000) * 5));
        this.reddit.userComments({
          user: request.user,
          count: count,
          after: lastId,
          limit: 100
        }, (e, res) => {
          if (e) {
            this.error(e);
            processMessage.edit("There was an error processing this user. Contact Rusty for more information.");
            clearInterval(intervalId);
            return;
          }

          let found = this.processCommentsPage(res);
          if (found.posts) {
            posts = posts.concat(found.posts);
            lastId = found.last;
          }

          if (res.children.length < 100 || count >= 25000) {
            clearInterval(intervalId);
            let postIdx = 0;
            let postTime = Date.now();

            let processPost = () => {
              processMessage.edit(processText(.5 + (postIdx / posts.length) * .5));

              let post = posts[postIdx];
              this.getComment(post).then(res => {
                for (let comment of res) {
                  var data = comment.data.children[0].data;
                  if (data.id === post.parentId && data.parent_id === data.link_id) {
                    results.push("" + post.url + post.commentId);
                  }
                }

                if (postIdx >= posts.length - 1) {
                  processMessage.edit(processText(1));
                  this.postResults(request, results);
                  if (this.queuedRequests.length > 0) {
                    this.processNextRequest();
                  }
                } else {
                  postIdx++;
                  if (Date.now() - postTime < 1000) {
                    setTimeout(processPost, 1000 - (Date.now() - postTime));
                  } else {
                    processPost();
                  }
                }
              }).catch(e => {
                this.error(e);
                processMessage.edit("There was an error processing this user. Contact Rusty for more information.");
              });
            }

            processPost();

          }
        });

        count += 100;
      };

      intervalId = setInterval(callback, 1000);

    }).catch(e => {
      this.error(e);
    });
  }

  processCommentsPage(res) {
    let posts = [];
    let last = "";

    for (let child of res.children) {
      var data = child.data;
      if (data.parent_id !== data.link_id) {
        if (VALID_THREAD_TITLES.find(title => data.link_title.indexOf(title) !== -1)) {
          posts.push({
            articleId: data.link_id.split("_")[1],
            parentId: data.parent_id.split("_")[1],
            commentId: data.id,
            url: data.link_url
          });
        }
      }
      last = data.name;
    }

    return {
      posts,
      last
    };
  }

  getComment(post) {
    return new Promise((resolve, reject) => {
      let url = `https://www.reddit.com/r/yugioh/comments/${post.articleId}.json?comment=${post.parentId}&limit=1`;
      https.get(url, res => {
        var body = "";

        res.on("data", data => {
          body += data;
        });

        res.on("end", () => {
          try {
            let json = JSON.parse(body);
            resolve(json);
          } catch (e) {
            reject(e);
          }
        });
      }).on("error", function(e) {
        reject(e);
      });
    });
  }

  postResults(request, results) {
    let msgs = [];
    let msg = "Count: **" + results.length + "**\n";
    for (let result of results) {
      if (msg.length + result.length > 1900) {
        msgs.push(msg);
        msg = result;
      } else {
        msg += result + "?context=2\n";
      }
    }

    msgs.push(msg);

    let sendNextMessage = () => {
      request.channel.send(msgs.shift())
        .then(msg => sendNextMessage())
        .catch(e => {
          this.error(e);
        });
    };

    sendNextMessage();
  }
}