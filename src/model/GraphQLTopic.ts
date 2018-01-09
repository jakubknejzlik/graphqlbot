import * as inflection from 'inflection'
import * as request from 'request'
import * as bluebird from 'bluebird'
import { Topic } from "./Topic";
import { TopicInteraction, TopicInteractionResponse, TopicInteractionQuestionResponse } from "./TopicInteraction";
import { introspectionQuery, GraphQLObjectType, GraphQLField, GraphQLNamedType, getNamedType, GraphQLScalarType, GraphQLType, GraphQLArgument, GraphQLInputObjectType } from 'graphql'
import { buildClientSchema } from "graphql/utilities/buildClientSchema";
import { GraphQLSchema } from "graphql/type/schema";
import { Message, Conversation } from "botkit";
import { graphql } from 'graphql/graphql';
import { GraphQlQuery, IArgumentsMap } from '../GraphQLQuery';
import { YAMLException, safeDump } from 'js-yaml';

const postAsync = bluebird.promisify(request.post)

// const graphql = require("graphql");
// const Query = require("graphql-query-builder");
// const yaml = require("js-yaml");

// const Topic = require("./topic");
// const GraphqlConversation = require("../graphql-conversation");

export class GraphqlTopic extends Topic {

  url: string
  schema: GraphQLSchema | null = null

  constructor(url: string) {
    super("GraphQL","...")
    this.url = url
  }

  async fetchSchema(): Promise<GraphQLSchema> {
    if (this.schema !== null) {
      return this.schema
    }
    let response = await postAsync({
      url: this.url,
      json: {
        query: introspectionQuery
      }
    });

    this.schema = buildClientSchema(response.body.data)
    return this.schema;
  }

  async getCommands(): Promise<string[]> {
    let cmds: string[] = []

    const schema = await this.fetchSchema()
    
    let query = schema.getTypeMap().Query as GraphQLObjectType;
    let queryFields = query.getFields()    
    for (let fieldName in queryFields) {
      cmds.push(fieldName)
    }
    
    let mutation = schema.getTypeMap().Mutation as GraphQLObjectType;
    let mutationFields = mutation.getFields()    
    for (let fieldName in mutationFields) {
      cmds.push(fieldName)
    }
    
    return cmds.map<string>(x => inflection.humanize(inflection.underscore(x)).toLowerCase())
  }

  async getPatterns(): Promise<(string | RegExp)[]> {
    return this.getCommands()
  }

  public async getInteractionForMessage(message: Message): Promise<TopicInteraction> {
    return new GraphqlTopicInteraction(message.text, await this.fetchSchema(), this.url)
  }
}

class GraphQLTopicInteractionResponse extends TopicInteractionQuestionResponse {
  
}

class GraphqlTopicInteraction extends TopicInteraction {
  url: string
  schema: GraphQLSchema 
  
  constructor(message: string, schema: GraphQLSchema, url: string){
    super(message)
    
    this.schema = schema
    this.url = url
  }

  async apply(convo: Conversation<Message>): Promise<TopicInteractionResponse | null> {
    let re = new RegExp(
      `^(select ((.+) from )?)?([\\w\\s-_]+)(\\(([^\\(\\)]+)\\))?$`,
      "i"
    );

    const matches = (this.message as string).match(re) as string[]
    const _queryName = matches[4] as string
    let _fields = (matches[3] || "").split(',').filter(x => x)
    const queryName = inflection.camelize(_queryName.replace(/\s/g,'_') ,true)

    let query = this.schema.getTypeMap().Query as GraphQLObjectType;
    let mutation = this.schema.getTypeMap().Mutation as GraphQLObjectType;

    let field = query.getFields()[queryName]
    let type = 'query'

    if (!query.getFields()[queryName]) {
      field = mutation.getFields()[queryName]
      type = 'mutation'
    }

    if (!field) {
      return `\`${queryName}\` not found`
    }

    let namedType = getNamedType(field.type) as GraphQLObjectType
    
    if (_fields.length === 0) {
      _fields = this.getScalarFields(namedType)
    }
    let args = await this.getArguments(convo, field.args, type)

    let q = this.buildQuery(queryName, namedType,args,_fields)
    let result = await this.sendQuery(`${type} ${q.toString()}`)
    let resultYaml = safeDump(result)

    return new GraphQLTopicInteractionResponse(`result: \`\`\`${resultYaml}\`\`\``)
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
    let _fields = type.getFields()
    for (let key in _fields) {
      let field = _fields[key];
      let type = getNamedType(field.type);
      if (type instanceof GraphQLScalarType) {
        fields.push(field.name);
      }
    }
    return fields;
  }

  async getArguments(convo: Conversation<Message>, args: GraphQLArgument[], type: string, params: string = null): Promise<IArgumentsMap> {
    // let params: Any = null;
    // try {
    //   params = message.match[6] && eval(`params = {${message.match[6]}}`);
    // } catch (e) {}
    let _params: IArgumentsMap = {}
    if (params === null &&  type == 'mutation') {
      for(let arg of args) {
        let namedType = getNamedType(arg.type)
        let value = await this.askForType(convo, namedType, arg.name)
        if (value) {
          _params[arg.name] = value
        }
      }
    }
    return _params;
  }

   async askForType(convo: Conversation<Message>, type: GraphQLNamedType, name: string): Promise<string | number | boolean | Object> {
    //   https://api.slack.com/docs/interactive-message-field-guide
    if (type instanceof GraphQLScalarType) {
      return await this.askForScalarType(convo, type, name);
    } else if (
      type instanceof GraphQLObjectType ||
      type instanceof GraphQLInputObjectType
    ) {
      let values: IArgumentsMap = {};
      let fields = type.getFields();
      for (let key in fields) {
        // key = key as string
        let field = fields[key];
        
        values[key] = await this.askForType(convo, getNamedType(field.type), field.name);
      }
      return values;
    }
  }
  async askForScalarType(convo: Conversation<Message>, type: GraphQLScalarType, name: string) {
    return new Promise((resolve, reject) => {
      convo.ask(`Please provide value ${name}:`, (response, convo) => {
        convo.next();
        resolve(type.parseValue(response.text));
      });
    });
  }

  buildQuery(name: string, type: GraphQLObjectType, args: IArgumentsMap, fields: string[]): GraphQlQuery {
    let q = new GraphQlQuery(name, args)
    console.log(fields)
    q.select.apply(q, fields);
    return q
  }
}