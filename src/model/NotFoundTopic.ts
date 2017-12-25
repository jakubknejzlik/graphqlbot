import { Topic } from "./Topic";
import { TopicInteraction } from "./TopicInteraction"
import { Message } from "botkit";

export class NotFoundTopic extends Topic {
  constructor() {
    super("NotFound", "");
  }

  async getPatterns(): Promise<(string | RegExp)[]> {
    return [".*"];
  }

  public async getInteractionForMessage(message: Message): Promise<TopicInteraction> {
    return new TopicInteraction(`I don't understand this, sorry`)
  }
}
