import * as inflection from "inflection";
import { Message, Conversation } from "botkit";
import { TopicInteraction } from "./TopicInteraction";

export class Topic {
  name: string;
  description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  public async getCommands(): Promise<string[]> {
    return [this.getCallName()];
  }

  public getCallName(): string {
    return inflection.humanize(inflection.underscore(this.name)).toLowerCase();
  }

  async getPatterns(): Promise<(string | RegExp)[]> {
    return [`^${this.getCallName()}$`];
  }

  public async validate(message: string): Promise<RegExpMatchArray | null> {
    const patterns = await this.getPatterns();
    for (let pattern of patterns) {
      // console.log(`validate?? ${pattern} => ${message}`);

      const match = message.match(pattern);
      if (match !== null) {
        return match;
      }
    }
    return null;
  }

  public async getInteractionForMessage(
    message: Message
  ): Promise<TopicInteraction> {
    return new TopicInteraction({ text: `Not implemented` });
  }
}
