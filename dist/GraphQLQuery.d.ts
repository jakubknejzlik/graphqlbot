export interface GraphQlQueryFactory {
    new (fnName: string | IAlias, argumentsMap?: IArgumentsMap): GraphQlQuery;
}
export interface IArgumentsMap {
    [index: string]: string | number | boolean | Object | EnumValue;
}
export interface IAlias {
    [index: string]: string | GraphQlQuery;
}
export interface IHead {
    fnName: IAlias;
    argumentsMap?: IArgumentsMap;
}
export interface IBody {
    attr: IAlias;
    argumentsMap?: IArgumentsMap;
}
export interface ISelection extends IArgumentsMap {
    _filter?: Object;
}
export declare class GraphQlQuery {
    private head;
    private body;
    private isContainer;
    private isWithoutBody;
    constructor(fnName: string | IAlias, argumentsMap?: IArgumentsMap);
    select(...selects: (string | ISelection | GraphQlQuery)[]): GraphQlQuery;
    filter(argumentsMap: IArgumentsMap): GraphQlQuery;
    join(...queries: GraphQlQuery[]): GraphQlQuery;
    withoutBody(): GraphQlQuery;
    toString(): string;
    private buildHeader();
    private buildArguments(argumentsMap);
    private getGraphQLValue(value);
    private objectToString(obj);
    private buildAlias(attr);
    private buildBody();
    private prepareAsInnerQuery(query);
}
export declare class EnumValue {
    private value;
    constructor(value: string);
    toString(): string;
}
export declare function enumValue(value: string): EnumValue;
