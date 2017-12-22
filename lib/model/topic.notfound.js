const Topic = require("./topic");

class NotFoundTopic extends Topic {
  constructor() {
    super("NotFound", "");
  }

  getPatterns() {
    return ".*";
  }

  async responseHandler(bot, message) {
    bot.reply(message, `sorry I don't understand`);
  }
}

module.exports = NotFoundTopic;
