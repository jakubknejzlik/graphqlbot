import { Topic } from "./Topic";
import { TopicInteraction } from "./TopicInteraction";
import { Message } from "botkit";

export class GreetingsTopic extends Topic {
  constructor() {
    super("Greetings", "");
  }

  async getPatterns(): Promise<(string | RegExp)[]> {
    return ["hi", "hello", "ciao", "greetings"];
  }

  public async getInteractionForMessage(
    message: Message
  ): Promise<TopicInteraction> {
    return new TopicInteraction(message, `Hello!`);
  }
}
