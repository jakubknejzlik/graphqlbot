import { Bot, Controller } from "botkit";
export declare class GraphQLBot<S, M> {
    controller: Controller<S, M, Bot<S, M>>;
    constructor(controller: Controller<S, M, Bot<S, M>>);
    initializeWithURL(url: string): Promise<boolean>;
}
