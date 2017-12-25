import { Topic } from "./Topic";
import { TopicInteraction } from "./TopicInteraction";
import { Message } from "botkit";
export declare class GreetingsTopic extends Topic {
    constructor();
    getPatterns(): Promise<(string | RegExp)[]>;
    getInteractionForMessage(message: Message): Promise<TopicInteraction>;
}
