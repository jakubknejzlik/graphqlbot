import { Topic } from "./Topic";
import { Message, Conversation } from "botkit";
export declare class HelpTopic extends Topic {
    topics: Topic[];
    constructor(topics: Topic[]);
    startInteraction(message: Message, convo: Conversation<Message>): Promise<void>;
}
