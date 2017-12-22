const GraphqlClient = require("./graphql-client");

const { NotFoundTopic, HelpTopic } = require("./model");

const initializeWithURL = async (controller, url) => {
  const client = new GraphqlClient(url);
  let topics = await client.getTopicsFromURL();

  for (let topic of topics) {
    await topic.assignToController(controller);
  }

  let help = new HelpTopic(topics);
  await help.assignToController(controller);

  let notfound = new NotFoundTopic();
  await notfound.assignToController(controller);

  return true;
};

module.exports = {
  initializeWithURL
};
