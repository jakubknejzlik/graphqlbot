import { Bot, Controller } from 'botkit';

import { GraphQLBotConversation } from './GraphQLBotConversation';
import { GraphqlTopic } from './model/GraphQLTopic';
import { TopicResolver } from './TopicResolver';

// const Conversation = require("./Conversation");
// const GraphqlClient = require("./graphql-client");

// const { NotFoundTopic, HelpTopic } = require("./model");

export class GraphQLBot<S,M> {

  controller: Controller<S,M,Bot<S,M>>

  constructor(controller: Controller<S,M,Bot<S,M>>) {
    this.controller = controller;
  }

  async initializeWithURL(url: string) {
    // const client = new GraphqlClient(url);
    // let topics = await client.getTopicsFromURL();

    // for (let topic of topics) {
    //   await topic.assignToController(controller);
    // }

    // let help = new HelpTopic(topics);
    // await help.assignToController(controller);

    // let notfound = new NotFoundTopic();
    // await notfound.assignToController(controller);
    // this.controller.hears(['attach'],['direct_message'],function(bot,message) {
    //   console.log('file',message)
    // })

    this.controller.hears(
      [".*"],
      ['direct_message','direct_mention'],
      async (bot, message) => {
        try {
          const resolver = new TopicResolver([new GraphqlTopic(url)])
          const conversation = new GraphQLBotConversation<S,M>(bot, resolver);
          conversation.start(message);
        } catch (e) {
          console.log(e);
        }
      }
    );

    return true;
  }
}

