import { Topic } from "./Topic";
import { Message, Conversation } from "botkit";

export class NotFoundTopic extends Topic {
  constructor() {
    super("NotFound", "");
  }

  async getPatterns(): Promise<(string | RegExp)[]> {
    return [".*"];
  }

  public async startInteraction(
    message: Message,
    convo: Conversation<Message>
  ): Promise<void> {
    convo.say(
      `I don't understand this, sorry. You can always write \`help\` for getting list of available actions.`
    );
  }
}
