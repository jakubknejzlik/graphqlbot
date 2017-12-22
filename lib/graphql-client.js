const Promise = require("bluebird");
const request = Promise.promisifyAll(require("request"));
const { introspectionQuery, buildClientSchema } = require("graphql");

const { GraphqlQueryTopic } = require("./model");

class GraphqlClient {
  constructor(url) {
    this.url = url;
  }

  async fetchSchema() {
    let response = await request.postAsync({
      url: this.url,
      json: {
        query: introspectionQuery
      }
    });

    let schema = response.body.data;
    return buildClientSchema(schema);
  }
  async getTopicsFromURL() {
    let schema = await this.fetchSchema();

    let topics = [];

    let queryFields = schema.getTypeMap().Query.getFields();
    for (let key in queryFields) {
      let field = queryFields[key];
      let topic = new GraphqlQueryTopic(field, this);
      topics.push(topic);
    }

    return topics;
  }

  async sendQuery(query) {
    let q = `query{ ${query.toString()}}`;
    console.log("sending query", q);
    let response = await request.postAsync({
      url: this.url,
      json: { query: q }
    });
    return response.body;
  }
}

module.exports = GraphqlClient;
