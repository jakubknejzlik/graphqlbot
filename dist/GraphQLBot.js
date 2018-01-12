"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const GraphQLBotConversation_1 = require("./GraphQLBotConversation");
const GraphQLTopic_1 = require("./model/GraphQLTopic");
const TopicResolver_1 = require("./TopicResolver");
// const Conversation = require("./Conversation");
// const GraphqlClient = require("./graphql-client");
// const { NotFoundTopic, HelpTopic } = require("./model");
class GraphQLBot {
    constructor(controller) {
        this.controller = controller;
    }
    initializeWithURL(url) {
        return __awaiter(this, void 0, void 0, function* () {
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
            this.controller.hears([".*"], ['direct_message', 'direct_mention'], (bot, message) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const resolver = new TopicResolver_1.TopicResolver([new GraphQLTopic_1.GraphqlTopic(url)]);
                    const conversation = new GraphQLBotConversation_1.GraphQLBotConversation(bot, resolver);
                    conversation.start(message);
                }
                catch (e) {
                    console.log(e);
                }
            }));
            return true;
        });
    }
}
exports.GraphQLBot = GraphQLBot;
//# sourceMappingURL=GraphQLBot.js.map