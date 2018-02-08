import { Conversation, Message } from "botkit";
import { GraphQLArgument, GraphQLEnumType, GraphQLField, GraphQLInputField, GraphQLObjectType, GraphQLScalarType } from "graphql";
import { GraphQLSchema } from "graphql/type/schema";
import { GraphQlQuery, IArgumentsMap } from "../GraphQLQuery";
import { Topic } from "./Topic";
export declare class GraphqlTopic extends Topic {
    url: string;
    constructor(url: string);
    fetchSchema(): Promise<GraphQLSchema>;
    getCommands(): Promise<string[]>;
    getPatterns(): Promise<(string | RegExp)[]>;
    startInteraction(message: Message, convo: Conversation<Message>): Promise<void>;
    sendQuery(query: string): Promise<any>;
    getScalarFields(type: GraphQLObjectType): string[];
    getArguments(message: Message, convo: Conversation<Message>, args: GraphQLArgument[], type: string, params?: string): Promise<IArgumentsMap>;
    askForField(message: Message, convo: Conversation<Message>, field: GraphQLField<any, any> | GraphQLInputField, parentName: string): Promise<string | number | boolean | Object>;
    askForScalarType(message: Message, convo: Conversation<Message>, type: GraphQLScalarType | GraphQLEnumType, name: string, description?: string | null): Promise<{}>;
    getAccessToken(message: Message, convo: Conversation<Message>): Promise<string>;
    buildQuery(name: string, type: GraphQLObjectType, args: IArgumentsMap, fields: string[]): GraphQlQuery;
}
