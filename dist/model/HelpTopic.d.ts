import { Topic } from "./Topic";
import { TopicInteraction } from "./TopicInteraction";
import { Message } from "botkit";
export declare class HelpTopic extends Topic {
    topics: Topic[];
    constructor(topics: Topic[]);
    getInteractionForMessage(message: Message): Promise<TopicInteraction>;
}
