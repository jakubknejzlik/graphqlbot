import { Message, Conversation } from "botkit";
export declare class TopicInteraction {
    message: Message;
    response?: string;
    constructor(message: Message, response?: string);
    apply(convo: Conversation<Message>): Promise<TopicInteractionResponse | null>;
}
export declare class TopicInteractionResponse extends String {
}
export declare class TopicInteractionQuestion extends TopicInteraction {
    apply(convo: Conversation<Message>): Promise<TopicInteractionResponse | null>;
}
export declare class TopicInteractionQuestionResponse extends TopicInteractionResponse {
    text: string;
    constructor(text: string);
    toString(): string;
}
