import { Topic } from "./Topic";
import { TopicInteraction } from "./TopicInteraction";
import { Message } from "botkit";

export class HelpTopic extends Topic {
  topics: Topic[]

  constructor(topics: Topic[]) {
    super("Help", "");
    this.topics = topics;
  }

  public async getInteractionForMessage(message: Message): Promise<TopicInteraction> {

    let commands: string[] = []
    for(let topic of this.topics) {
      commands = commands.concat(await topic.getCommands())
    }

    return new TopicInteraction(message.text,`You can call these functions: \`\`\`${commands.join("\n")}\`\`\``)
  }
}

