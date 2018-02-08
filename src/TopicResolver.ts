import { Message } from "botkit";
import { Topic } from "./model/Topic";
import { NotFoundTopic } from "./model/NotFoundTopic";
import { GreetingsTopic } from "./model/GreetingsTopic";
import { HelpTopic } from "./model/HelpTopic";

export class TopicResolver {
  topics: Topic[] = [new GreetingsTopic()];
  constructor(topics: Topic[]) {
    this.topics = this.topics.concat(topics);
    this.topics.push(new HelpTopic(this.topics));
  }

  async getTopicForMessage(message: Message): Promise<Topic> {
    for (let topic of this.topics) {
      if (
        typeof message.text !== "undefined" &&
        (await topic.validate(message.text))
      ) {
        return topic;
      }
    }

    return new NotFoundTopic();
  }
}

// module.exports = ConversationResolver;
