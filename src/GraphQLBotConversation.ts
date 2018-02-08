// import ConversationResolver from "./Conversation.Resolver";
import { Bot, Conversation, Message } from "botkit";

import { TopicResolver } from "./TopicResolver";

export class GraphQLBotConversation<S, M extends Message> {
  bot: Bot<S, M>;
  resolver: TopicResolver;

  constructor(bot: Bot<S, M>, resolver: TopicResolver) {
    this.bot = bot;
    this.resolver = resolver;
  }

  async start(message: M) {
    const convo = await this.startConversation(message);

    try {
      const topic = await this.resolver.getTopicForMessage(message);
      topic.startInteraction(message, convo);
    } catch (err) {
      convo.say(
        `Failed to get response \`\`\`${err.message} ${err.stack}\`\`\``
      );
    }
  }

  async startConversation(message: M): Promise<Conversation<M>> {
    return new Promise<Conversation<M>>((resolve, reject) => {
      this.bot.startConversation(message, function(err, convo) {
        if (err) return reject(err);
        resolve(convo);
      });
    });
  }

  async processMessage(message: M) {}
}
