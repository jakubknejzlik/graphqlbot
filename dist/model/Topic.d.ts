import { Message } from "botkit";
import { TopicInteraction } from "./TopicInteraction";
export declare class Topic {
    name: string;
    description: string;
    constructor(name: string, description: string);
    getCommands(): Promise<string[]>;
    getCallName(): string;
    getPatterns(): Promise<(string | RegExp)[]>;
    validate(message: string): Promise<RegExpMatchArray | null>;
    getInteractionForMessage(message: Message): Promise<TopicInteraction>;
}
