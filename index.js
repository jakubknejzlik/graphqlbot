const Botkit = require("botkit");

const bot = require("./lib/bot");

const GRAPHQL_URL =
  process.env.GRAPHQL_URL || "https://www.universe.com/graphql";

const start = async url => {
  const controller = Botkit.slackbot({
    // debug: true
  });

  await bot.initializeWithURL(controller, url);

  // give the bot something to listen for.
  // controller.hears(
  //   ".*",
  //   ["direct_message", "direct_mention", "mention"],
  //   (bot, message) => {
  //     console.log(message);
  //     bot.reply(message, `Hello yourself. ${message.text}`);
  //   }
  // );

  // controller.hears(["hello", "hi"], ["direct_message"], (bot, message) => {
  //   bot.startConversation(message, function(err, convo) {
  //     convo.addQuestion("How are you?", function(response, convo) {
  //       convo.say("Cool, you said: " + response.text);
  //       convo.addQuestion("Anything else?2", (response, convo) => {
  //         convo.say("bye2");
  //         convo.next();
  //       });
  //       convo.next();
  //     });
  //     convo.addQuestion("Anything else?", (response, convo) => {
  //       convo.say("bye");
  //       convo.next();
  //     });
  //   });
  // });

  controller
    .spawn({
      token: process.env.SLACK_TOKEN
    })
    .startRTM();
};

start(GRAPHQL_URL);
