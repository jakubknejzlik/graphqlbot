import { Message } from "botkit";
import { Topic } from "./model/Topic";
export declare class TopicResolver {
    topics: Topic[];
    constructor(topics: Topic[]);
    getTopicForMessage(message: Message): Promise<Topic>;
}
