import { Bot, Conversation, Message } from 'botkit';
import { TopicResolver } from './TopicResolver';
export declare class GraphQLBotConversation<S, M extends Message> {
    bot: Bot<S, M>;
    resolver: TopicResolver;
    constructor(bot: Bot<S, M>, resolver: TopicResolver);
    start(message: M): Promise<void>;
    startConversation(message: M): Promise<Conversation<M>>;
    processMessage(message: M): Promise<void>;
}
