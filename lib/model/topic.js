const inflection = require("inflection");

class Topic {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  getCallName() {
    return inflection.humanize(inflection.tableize(this.name)).toLowerCase();
  }

  getPatterns() {
    return [`^${this.getCallName()}$`];
  }

  async responseHandler(bot, message) {
    bot.reply(message, `no action implemented`);
  }

  assignToController(controller) {
    console.log("assigning", this.getPatterns());
    controller.hears(
      this.getPatterns(),
      ["direct_message", "direct_mention", "mention"],
      async (bot, message) => {
        try {
          await this.responseHandler(bot, message);
        } catch (err) {
          bot.reply(message, `something failed: ${err.message}`);
        }
      }
    );
  }
}

module.exports = Topic;
