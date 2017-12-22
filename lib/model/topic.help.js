const Topic = require("./topic");

class HelpTopic extends Topic {
  constructor(topics) {
    super("Help", "");
    this.topics = topics;
  }

  async responseHandler(bot, message) {
    let allTopics = this.topics
      .map(x => {
        return x.getCallName();
      })
      .join("\n");
    bot.reply(message, `You can ask me these: ${allTopics}`);
  }
}

module.exports = HelpTopic;
