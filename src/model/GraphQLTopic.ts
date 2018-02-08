import * as bluebird from "bluebird";
import { Conversation, Message } from "botkit";
import {
  getNamedType,
  GraphQLArgument,
  GraphQLEnumType,
  GraphQLField,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
  introspectionQuery
} from "graphql";
import { GraphQLBoolean } from "graphql/type/scalars";
import { GraphQLSchema } from "graphql/type/schema";
import { buildClientSchema } from "graphql/utilities/buildClientSchema";
import * as inflection from "inflection";
import { safeDump } from "js-yaml";
import * as request from "request";
import { Cache, ExpirationStrategy, MemoryStorage } from "node-ts-cache";

import { GraphQlQuery, IArgumentsMap } from "../GraphQLQuery";
import { Topic } from "./Topic";
import {
  TopicInteraction,
  TopicInteractionQuestionResponse,
  TopicInteractionResponse
} from "./TopicInteraction";
import { sharedServer } from "../AuthServer";

const postAsync = bluebird.promisify(request.post);

const accessTokenCache = new ExpirationStrategy(new MemoryStorage());
const schemaCache = new ExpirationStrategy(new MemoryStorage());

export class GraphqlTopic extends Topic {
  url: string;

  constructor(url: string) {
    super("GraphQL", "...");
    this.url = url;
  }

  async fetchSchema(): Promise<GraphQLSchema> {
    let schema = await schemaCache.getItem<GraphQLSchema>("schema");
    if (schema) {
      return schema;
    }
    let response = await postAsync({
      url: this.url,
      json: {
        query: introspectionQuery
      }
    });

    schema = buildClientSchema(response.body.data);
    schemaCache.setItem("schema", schema, { ttl: 60 });
    return schema;
  }

  async getCommands(): Promise<string[]> {
    let cmds: string[] = [];

    const schema = await this.fetchSchema();

    let query = schema.getTypeMap().Query as GraphQLObjectType;
    let queryFields = query.getFields();
    for (let fieldName in queryFields) {
      cmds.push(fieldName);
    }

    let mutation = schema.getTypeMap().Mutation as GraphQLObjectType;
    let mutationFields = mutation.getFields();
    for (let fieldName in mutationFields) {
      cmds.push(fieldName);
    }

    return cmds.map<string>(x =>
      inflection.humanize(inflection.underscore(x)).toLowerCase()
    );
  }

  async getPatterns(): Promise<(string | RegExp)[]> {
    return this.getCommands();
  }

  public async getInteractionForMessage(
    message: Message
  ): Promise<TopicInteraction> {
    return new GraphqlTopicInteraction(
      message,
      await this.fetchSchema(),
      this.url
    );
  }
}

class GraphQLTopicInteractionResponse extends TopicInteractionQuestionResponse {}

class GraphqlTopicInteraction extends TopicInteraction {
  url: string;
  schema: GraphQLSchema;

  constructor(message: Message, schema: GraphQLSchema, url: string) {
    super(message);

    this.schema = schema;
    this.url = url;
  }

  async apply(
    convo: Conversation<Message>
  ): Promise<TopicInteractionResponse | null> {
    let re = new RegExp(
      `^(select ((.+) from )?)?([\\w\\s-_]+)(\\(([^\\(\\)]+)\\))?$`,
      "i"
    );
    const matches = (this.message.text as string).match(re) as string[];
    const _queryName = matches[4] as string;
    let _fields = (matches[3] || "").split(",").filter(x => x);
    const queryName = inflection.camelize(_queryName.replace(/\s/g, "_"), true);

    let query = this.schema.getTypeMap().Query as GraphQLObjectType;
    let mutation = this.schema.getTypeMap().Mutation as GraphQLObjectType;

    let field = query.getFields()[queryName];
    let type = "query";

    if (!query.getFields()[queryName]) {
      field = mutation.getFields()[queryName];
      type = "mutation";
    }

    if (!field) {
      return `\`${queryName}\` not found`;
    }

    let namedType = getNamedType(field.type) as GraphQLObjectType;
    if (_fields.length === 0 && namedType instanceof GraphQLObjectType) {
      _fields = this.getScalarFields(namedType);
    }
    let args = null;
    try {
      args = await this.getArguments(convo, field.args, type);
    } catch (err) {
      return new GraphQLTopicInteractionResponse(`${err.message}`);
    }

    let q = this.buildQuery(queryName, namedType, args, _fields);
    let result = await this.sendQuery(`${type} ${q.toString()}`);
    let resultYaml = safeDump(
      result.data[queryName] ? result.data[queryName] : result
    );

    return new GraphQLTopicInteractionResponse(
      `result: \`\`\`${resultYaml}\`\`\``
    );
  }

  async sendQuery(query: string) {
    let q = query;
    console.log("sending query", q);
    let response = await postAsync({
      url: this.url,
      json: { query: q }
    });
    return response.body;
  }

  getScalarFields(type: GraphQLObjectType): string[] {
    let fields: string[] = [];
    let _fields = type.getFields();
    for (let key in _fields) {
      let field = _fields[key];
      let type = getNamedType(field.type);
      if (type instanceof GraphQLScalarType) {
        fields.push(field.name);
      }
    }
    return fields;
  }

  async getArguments(
    convo: Conversation<Message>,
    args: GraphQLArgument[],
    type: string,
    params: string = null
  ): Promise<IArgumentsMap> {
    // let params: Any = null;
    // try {
    //   params = message.match[6] && eval(`params = {${message.match[6]}}`);
    // } catch (e) {}
    let _params: IArgumentsMap = {};
    if (params === null) {
      for (let arg of args) {
        let value = await this.askForField(convo, arg, "");
        if (value) {
          _params[arg.name] = value;
        }
      }
    }
    return _params;
  }

  async askForField(
    convo: Conversation<Message>,
    field: GraphQLField<any, any> | GraphQLInputField,
    parentName: string
  ): Promise<string | number | boolean | Object> {
    //   https://api.slack.com/docs/interactive-message-field-guide
    let type = getNamedType(field.type);
    if (type instanceof GraphQLScalarType || type instanceof GraphQLEnumType) {
      return await this.askForScalarType(
        convo,
        type,
        `${parentName}${field.name}`,
        `${field.description}`
      );
    } else if (
      type instanceof GraphQLObjectType ||
      type instanceof GraphQLInputObjectType
    ) {
      let values: IArgumentsMap = {};
      let fields = type.getFields();
      for (let key in fields) {
        // key = key as string
        let subfield = fields[key];
        values[key] = await this.askForField(
          convo,
          subfield,
          `${parentName}${field.name}.`
        );
      }
      return values;
    }
  }
  async askForScalarType(
    convo: Conversation<Message>,
    type: GraphQLScalarType | GraphQLEnumType,
    name: string,
    description: string | null = null
  ) {
    if (name == "access_token") {
      return this.getAccessToken(convo);
    }

    let descriptionArray: string[] = [];
    if (description) {
      descriptionArray.push(description);
    }

    if (type instanceof GraphQLEnumType) {
      let possibleValues = type
        .getValues()
        .map(x => `${x.name}=>${x.value}`)
        .join(", ");
      descriptionArray.push(`possible values: ${possibleValues}`);
    } else if (type === GraphQLBoolean) {
      descriptionArray.push(`possible values: true/false`);
    }

    return new Promise((resolve, reject) => {
      convo.ask(
        `Please provide value ${name} (${descriptionArray.join(";")}):`,
        (response, convo) => {
          convo.next();
          if (response.text === ":q") {
            reject(new Error("Ok, let's start over."));
          } else {
            resolve(type.parseValue(response.text));
          }
        }
      );
    });
  }

  async getAccessToken(convo: Conversation<Message>): Promise<string> {
    let cachedToken = await accessTokenCache.getItem<string>(this.message.user);
    if (cachedToken) return cachedToken;
    return new Promise<string>((resolve, reject) => {
      let redirectUrl = sharedServer.getRedirectUrl();

      convo.beforeThread("access_token", async (convo, next) => {
        let token = await sharedServer.waitForToken(redirectUrl);
        await accessTokenCache.setItem(this.message.user, token, {
          ttl: 60 * 10
        });
        resolve(token);
        next(null);
      });

      convo.addMessage(
        "Got it! I'll store the token for 10 minutes. So let's continue...",
        "access_token"
      );

      convo.say({
        text: `Access token is required for this action, please follow this link:\n ${redirectUrl}`,
        action: "access_token"
      });
    });
  }

  buildQuery(
    name: string,
    type: GraphQLObjectType,
    args: IArgumentsMap,
    fields: string[]
  ): GraphQlQuery {
    let q = new GraphQlQuery(name, args);
    q.select.apply(q, fields);
    return q;
  }
}
