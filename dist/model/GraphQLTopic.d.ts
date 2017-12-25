import { Topic } from "./Topic";
import { TopicInteraction } from "./TopicInteraction";
import { GraphQLSchema } from "graphql/type/schema";
import { Message } from "botkit";
export declare class GraphqlTopic extends Topic {
    url: string;
    schema: GraphQLSchema | null;
    constructor(url: string);
    fetchSchema(): Promise<GraphQLSchema>;
    getCommands(): Promise<string[]>;
    getPatterns(): Promise<(string | RegExp)[]>;
    getInteractionForMessage(message: Message): Promise<TopicInteraction>;
}
