const Botkit = require("botkit");

const controller = Botkit.slackbot({
  //   debug: true
});

// give the bot something to listen for.
controller.hears(
  ".*",
  ["direct_message", "direct_mention", "mention"],
  (bot, message) => {
    console.log(message);
    bot.reply(message, `Hello yourself. ${message.text}`);
  }
);

controller
  .spawn({
    token: process.env.SLACK_TOKEN
  })
  .startRTM();
