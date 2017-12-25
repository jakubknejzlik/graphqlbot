"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inflection = require("inflection");
const request = require("request");
const bluebird = require("bluebird");
const Topic_1 = require("./Topic");
const TopicInteraction_1 = require("./TopicInteraction");
const graphql_1 = require("graphql");
const buildClientSchema_1 = require("graphql/utilities/buildClientSchema");
const GraphQLQuery_1 = require("../GraphQLQuery");
const js_yaml_1 = require("js-yaml");
const postAsync = bluebird.promisify(request.post);
// const graphql = require("graphql");
// const Query = require("graphql-query-builder");
// const yaml = require("js-yaml");
// const Topic = require("./topic");
// const GraphqlConversation = require("../graphql-conversation");
class GraphqlTopic extends Topic_1.Topic {
    constructor(url) {
        super("GraphQL", "...");
        this.schema = null;
        this.url = url;
    }
    fetchSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.schema !== null) {
                return this.schema;
            }
            let response = yield postAsync({
                url: this.url,
                json: {
                    query: graphql_1.introspectionQuery
                }
            });
            this.schema = buildClientSchema_1.buildClientSchema(response.body.data);
            return this.schema;
        });
    }
    getCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            let cmds = [];
            const schema = yield this.fetchSchema();
            let query = schema.getTypeMap().Query;
            let queryFields = query.getFields();
            for (let fieldName in queryFields) {
                cmds.push(fieldName);
            }
            let mutation = schema.getTypeMap().Mutation;
            let mutationFields = mutation.getFields();
            for (let fieldName in mutationFields) {
                cmds.push(fieldName);
            }
            return cmds.map(x => inflection.humanize(inflection.underscore(x)).toLowerCase());
        });
    }
    getPatterns() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getCommands();
        });
    }
    getInteractionForMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return new GraphqlTopicInteraction(message.text, yield this.fetchSchema(), this.url);
        });
    }
}
exports.GraphqlTopic = GraphqlTopic;
class GraphQLTopicInteractionResponse extends TopicInteraction_1.TopicInteractionQuestionResponse {
}
class GraphqlTopicInteraction extends TopicInteraction_1.TopicInteraction {
    constructor(message, schema, url) {
        super(message);
        this.schema = schema;
        this.url = url;
    }
    apply(convo) {
        return __awaiter(this, void 0, void 0, function* () {
            let re = new RegExp(`^(select ((.+) from )?)?([\\w\\s-_]+)(\\(([^\\(\\)]+)\\))?$`, "i");
            const matches = this.message.match(re);
            const _queryName = matches[4];
            let _fields = (matches[3] || "").split(',').filter(x => x);
            const queryName = inflection.camelize(_queryName.replace(/\s/g, '_'), true);
            let query = this.schema.getTypeMap().Query;
            let mutation = this.schema.getTypeMap().Mutation;
            let field = query.getFields()[queryName];
            let type = 'query';
            if (!query.getFields()[queryName]) {
                field = mutation.getFields()[queryName];
                type = 'mutation';
            }
            if (!field) {
                return `\`${queryName}\` not found`;
            }
            let namedType = graphql_1.getNamedType(field.type);
            if (_fields.length === 0) {
                _fields = this.getScalarFields(namedType);
            }
            let args = yield this.getArguments(convo, field.args, type);
            let q = this.buildQuery(queryName, namedType, args, _fields);
            let result = yield this.sendQuery(`${type} ${q.toString()}`);
            let resultYaml = js_yaml_1.safeDump(result);
            return new GraphQLTopicInteractionResponse(`result: \`\`\`${resultYaml}\`\`\``);
        });
    }
    sendQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let q = query;
            console.log("sending query", q);
            let response = yield postAsync({
                url: this.url,
                json: { query: q }
            });
            return response.body;
        });
    }
    getScalarFields(type) {
        let fields = [];
        let _fields = type.getFields();
        for (let key in _fields) {
            let field = _fields[key];
            let type = graphql_1.getNamedType(field.type);
            if (type instanceof graphql_1.GraphQLScalarType) {
                fields.push(field.name);
            }
        }
        return fields;
    }
    getArguments(convo, args, type, params = null) {
        return __awaiter(this, void 0, void 0, function* () {
            // let params: Any = null;
            // try {
            //   params = message.match[6] && eval(`params = {${message.match[6]}}`);
            // } catch (e) {}
            let _params = {};
            if (params === null && type == 'mutation') {
                for (let arg of args) {
                    let namedType = graphql_1.getNamedType(arg.type);
                    let value = yield this.askForType(convo, namedType, arg.name);
                    if (value) {
                        _params[arg.name] = value;
                    }
                }
            }
            return _params;
        });
    }
    askForType(convo, type, name) {
        return __awaiter(this, void 0, void 0, function* () {
            //   https://api.slack.com/docs/interactive-message-field-guide
            if (type instanceof graphql_1.GraphQLScalarType) {
                return yield this.askForScalarType(convo, type, name);
            }
            else if (type instanceof graphql_1.GraphQLObjectType ||
                type instanceof graphql_1.GraphQLInputObjectType) {
                let values = {};
                let fields = type.getFields();
                for (let key in fields) {
                    // key = key as string
                    let field = fields[key];
                    values[key] = yield this.askForType(convo, graphql_1.getNamedType(field.type), field.name);
                }
                return values;
            }
        });
    }
    askForScalarType(convo, type, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                convo.ask(`Please provide value ${name}:`, (response, convo) => {
                    convo.next();
                    resolve(type.parseValue(response.text));
                });
            });
        });
    }
    buildQuery(name, type, args, fields) {
        let q = new GraphQLQuery_1.GraphQlQuery(name, args);
        console.log(fields);
        q.select.apply(q, fields);
        return q;
    }
}
//# sourceMappingURL=GraphQLTopic.js.map