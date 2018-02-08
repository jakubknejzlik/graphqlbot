const Botkit = require("botkit");

const GraphQLBot = require("./dist/GraphQLBot");
const sharedServer = require("./dist/AuthServer").sharedServer;

const GRAPHQL_URL = process.env.GRAPHQL_URL;

const start = async (url, token) => {
  const controller = Botkit.slackbot({
    // debug: true,
    retry: Infinity
  });

  const bot = new GraphQLBot.GraphQLBot(controller);

  await bot.initializeWithURL(url);

  controller
    .spawn({
      token: process.env.SLACK_TOKEN
    })
    .startRTM();
};

start(GRAPHQL_URL);

const port = process.env.PORT || 80;
sharedServer.start(port);
