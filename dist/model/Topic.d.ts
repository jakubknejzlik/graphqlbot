import { Message, Conversation } from "botkit";
export declare class Topic {
    name: string;
    description: string;
    constructor(name: string, description: string);
    getCommands(): Promise<string[]>;
    getCallName(): string;
    getPatterns(): Promise<(string | RegExp)[]>;
    validate(message: string): Promise<RegExpMatchArray | null>;
    startInteraction(message: Message, convo: Conversation<Message>): Promise<void>;
}
