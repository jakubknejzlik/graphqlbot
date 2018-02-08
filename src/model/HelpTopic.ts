import * as path from "path";
import * as fs from "fs";
import { Topic } from "./Topic";
import { TopicInteraction } from "./TopicInteraction";
import { Message } from "botkit";

let helpText = fs.readFileSync(path.join(__dirname, "../../HELP.md"));

export class HelpTopic extends Topic {
  topics: Topic[];

  constructor(topics: Topic[]) {
    super("Help", "");
    this.topics = topics;
  }

  public async getInteractionForMessage(
    message: Message
  ): Promise<TopicInteraction> {
    let commands: string[] = [];
    for (let topic of this.topics) {
      commands = commands.concat(await topic.getCommands());
    }

    return new TopicInteraction(
      message,
      `Available actions: \`\`\`${commands.join(
        "\n"
      )}\`\`\` *Help:* \n${helpText}`
    );
  }
}
