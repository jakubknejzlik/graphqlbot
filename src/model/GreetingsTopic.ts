import { Topic } from "./Topic";
import { Message, Conversation } from "botkit";

export class GreetingsTopic extends Topic {
  constructor() {
    super("Greetings", "");
  }

  async getPatterns(): Promise<(string | RegExp)[]> {
    return ["hi", "hello", "ciao", "greetings"];
  }

  public async startInteraction(
    message: Message,
    convo: Conversation<Message>
  ): Promise<void> {
    convo.say(`Hello!`);
  }
}
