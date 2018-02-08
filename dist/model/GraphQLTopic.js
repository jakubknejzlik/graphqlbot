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
const bluebird = require("bluebird");
const graphql_1 = require("graphql");
const scalars_1 = require("graphql/type/scalars");
const buildClientSchema_1 = require("graphql/utilities/buildClientSchema");
const inflection = require("inflection");
const js_yaml_1 = require("js-yaml");
const request = require("request");
const node_ts_cache_1 = require("node-ts-cache");
const GraphQLQuery_1 = require("../GraphQLQuery");
const Topic_1 = require("./Topic");
const TopicInteraction_1 = require("./TopicInteraction");
const AuthServer_1 = require("../AuthServer");
const postAsync = bluebird.promisify(request.post);
const accessTokenCache = new node_ts_cache_1.ExpirationStrategy(new node_ts_cache_1.MemoryStorage());
const schemaCache = new node_ts_cache_1.ExpirationStrategy(new node_ts_cache_1.MemoryStorage());
class GraphqlTopic extends Topic_1.Topic {
    constructor(url) {
        super("GraphQL", "...");
        this.url = url;
    }
    fetchSchema() {
        return __awaiter(this, void 0, void 0, function* () {
            let schema = yield schemaCache.getItem("schema");
            if (schema) {
                return schema;
            }
            let response = yield postAsync({
                url: this.url,
                json: {
                    query: graphql_1.introspectionQuery
                }
            });
            schema = buildClientSchema_1.buildClientSchema(response.body.data);
            schemaCache.setItem("schema", schema, { ttl: 60 });
            return schema;
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
            return new GraphqlTopicInteraction(message, yield this.fetchSchema(), this.url);
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
            const matches = this.message.text.match(re);
            const _queryName = matches[4];
            let _fields = (matches[3] || "").split(",").filter(x => x);
            const queryName = inflection.camelize(_queryName.replace(/\s/g, "_"), true);
            let query = this.schema.getTypeMap().Query;
            let mutation = this.schema.getTypeMap().Mutation;
            let field = query.getFields()[queryName];
            let type = "query";
            if (!query.getFields()[queryName]) {
                field = mutation.getFields()[queryName];
                type = "mutation";
            }
            if (!field) {
                return `\`${queryName}\` not found`;
            }
            let namedType = graphql_1.getNamedType(field.type);
            if (_fields.length === 0 && namedType instanceof graphql_1.GraphQLObjectType) {
                _fields = this.getScalarFields(namedType);
            }
            let args = null;
            try {
                args = yield this.getArguments(convo, field.args, type);
            }
            catch (err) {
                return new GraphQLTopicInteractionResponse(`${err.message}`);
            }
            let q = this.buildQuery(queryName, namedType, args, _fields);
            let result = yield this.sendQuery(`${type} ${q.toString()}`);
            let resultYaml = js_yaml_1.safeDump((result.data && result.data[queryName]) || result);
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
            if (params === null) {
                for (let arg of args) {
                    let value = yield this.askForField(convo, arg, "");
                    if (value) {
                        _params[arg.name] = value;
                    }
                }
            }
            return _params;
        });
    }
    askForField(convo, field, parentName) {
        return __awaiter(this, void 0, void 0, function* () {
            //   https://api.slack.com/docs/interactive-message-field-guide
            let type = graphql_1.getNamedType(field.type);
            if (type instanceof graphql_1.GraphQLScalarType || type instanceof graphql_1.GraphQLEnumType) {
                return yield this.askForScalarType(convo, type, `${parentName}${field.name}`, `${field.description}`);
            }
            else if (type instanceof graphql_1.GraphQLObjectType ||
                type instanceof graphql_1.GraphQLInputObjectType) {
                let values = {};
                let fields = type.getFields();
                for (let key in fields) {
                    // key = key as string
                    let subfield = fields[key];
                    values[key] = yield this.askForField(convo, subfield, `${parentName}${field.name}.`);
                }
                return values;
            }
        });
    }
    askForScalarType(convo, type, name, description = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name == "access_token") {
                return this.getAccessToken(convo);
            }
            let descriptionArray = [];
            if (description) {
                descriptionArray.push(description);
            }
            if (type instanceof graphql_1.GraphQLEnumType) {
                let possibleValues = type
                    .getValues()
                    .map(x => `${x.name}=>${x.value}`)
                    .join(", ");
                descriptionArray.push(`possible values: ${possibleValues}`);
            }
            else if (type === scalars_1.GraphQLBoolean) {
                descriptionArray.push(`possible values: true/false`);
            }
            return new Promise((resolve, reject) => {
                convo.ask(`Please provide value ${name} (${descriptionArray.join(";")}):`, (response, convo) => {
                    convo.next();
                    if (response.text === ":q") {
                        reject(new Error("Ok, let's start over."));
                    }
                    else {
                        resolve(type.parseValue(response.text));
                    }
                });
            });
        });
    }
    getAccessToken(convo) {
        return __awaiter(this, void 0, void 0, function* () {
            let cachedToken = yield accessTokenCache.getItem(this.message.user);
            if (cachedToken)
                return cachedToken;
            return new Promise((resolve, reject) => {
                let redirectUrl = AuthServer_1.sharedServer.getRedirectUrl();
                convo.beforeThread("access_token", (convo, next) => __awaiter(this, void 0, void 0, function* () {
                    let token = yield AuthServer_1.sharedServer.waitForToken(redirectUrl);
                    yield accessTokenCache.setItem(this.message.user, token, {
                        ttl: 60 * 10
                    });
                    resolve(token);
                    next(null);
                }));
                convo.addMessage("Got it! I'll store the token for 10 minutes. So let's continue...", "access_token");
                convo.say({
                    text: `Access token is required for this action, please follow this link:\n ${redirectUrl}`,
                    action: "access_token"
                });
            });
        });
    }
    buildQuery(name, type, args, fields) {
        let q = new GraphQLQuery_1.GraphQlQuery(name, args);
        q.select.apply(q, fields);
        return q;
    }
}
//# sourceMappingURL=GraphQLTopic.js.map