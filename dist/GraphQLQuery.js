"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GraphQlQuery {
    constructor(fnName, argumentsMap = {}) {
        this.head =
            typeof fnName === "string"
                ? { fnName: { [fnName]: fnName } }
                : { fnName };
        this.head.argumentsMap = argumentsMap;
        this.body = [];
        this.isContainer = false;
        this.isWithoutBody = false;
    }
    select(...selects) {
        if (this.isContainer) {
            throw new Error("Can`t use selection on joined query.");
        }
        this.body = this.body.concat(selects.map(item => {
            let selection = {};
            if (typeof item === "string") {
                selection.attr = { [item]: item };
                selection.argumentsMap = {};
            }
            else if (item instanceof GraphQlQuery) {
                selection = item;
            }
            else if (typeof item === "object") {
                selection.argumentsMap = item["_filter"] || {};
                delete item["_filter"];
                selection.attr = item;
            }
            return selection;
        }));
        return this;
    }
    filter(argumentsMap) {
        for (let key in argumentsMap) {
            if (argumentsMap.hasOwnProperty(key)) {
                this.head.argumentsMap[key] = argumentsMap[key];
            }
        }
        return this;
    }
    join(...queries) {
        const combined = new GraphQlQuery("");
        combined.isContainer = true;
        combined.body.push(this);
        combined.body = combined.body.concat(queries);
        return combined;
    }
    withoutBody() {
        if (this.isContainer) {
            throw new Error("Can`t use withoutBody on joined query.");
        }
        this.isWithoutBody = true;
        return this;
    }
    toString() {
        if (this.isContainer) {
            return `{ ${this.buildBody()} }`;
        }
        else if (this.isWithoutBody) {
            return `{ ${this.buildHeader()} }`;
        }
        else {
            return `{ ${this.buildHeader()}{${this.buildBody()}} }`;
        }
    }
    buildHeader() {
        return (this.buildAlias(this.head.fnName) +
            this.buildArguments(this.head.argumentsMap));
    }
    buildArguments(argumentsMap) {
        const query = this.objectToString(argumentsMap);
        return query ? `(${query})` : "";
    }
    getGraphQLValue(value) {
        if (Array.isArray(value)) {
            const arrayString = value
                .map(item => {
                return this.getGraphQLValue(item);
            })
                .join();
            return `[${arrayString}]`;
        }
        else if (value instanceof EnumValue) {
            return value.toString();
        }
        else if ("object" === typeof value) {
            return "{" + this.objectToString(value) + "}";
        }
        else {
            return JSON.stringify(value);
        }
    }
    objectToString(obj) {
        return Object.keys(obj)
            .map(key => `${key}: ${this.getGraphQLValue(obj[key])}`)
            .join(", ");
    }
    buildAlias(attr) {
        let alias = Object.keys(attr)[0];
        let value = this.prepareAsInnerQuery(attr[alias]);
        value = alias !== value ? `${alias}: ${value}` : value;
        return value;
    }
    buildBody() {
        return this.body
            .map((item) => {
            if (item instanceof GraphQlQuery) {
                return this.prepareAsInnerQuery(item);
            }
            else {
                return (this.buildAlias(item["attr"]) +
                    this.buildArguments(item["argumentsMap"]));
            }
        })
            .join(" ");
    }
    prepareAsInnerQuery(query) {
        let ret = "";
        if (query instanceof GraphQlQuery) {
            ret = query.toString();
            ret = ret.substr(2, ret.length - 4);
        }
        else {
            ret = query.toString();
        }
        return ret;
    }
}
exports.GraphQlQuery = GraphQlQuery;
class EnumValue {
    constructor(value) {
        this.value = value;
    }
    toString() {
        return this.value;
    }
}
exports.EnumValue = EnumValue;
function enumValue(value) {
    return new EnumValue(value);
}
exports.enumValue = enumValue;
//# sourceMappingURL=GraphQLQuery.js.map