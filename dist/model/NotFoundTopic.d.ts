import { Topic } from "./Topic";
import { Message, Conversation } from "botkit";
export declare class NotFoundTopic extends Topic {
    constructor();
    getPatterns(): Promise<(string | RegExp)[]>;
    startInteraction(message: Message, convo: Conversation<Message>): Promise<void>;
}
