const Topic = require("./topic");
const graphql = require("graphql");
const Query = require("graphql-query-builder");

class GraphqlQueryTopic extends Topic {
  constructor(field, client) {
    super(field.name, field.description);
    this.field = field;
    this.client = client;
    this.namedType = graphql.getNamedType(this.field.type);
    this.namedTypeFields = this.namedType.getFields();
  }

  getPatterns() {
    let name = this.getCallName();

    let re = new RegExp(`^(get ((.+) from )?)?(${name})(\\(([^\\(\\)]+)\\))?$`);
    return [re];
  }

  getScalarFields() {
    let fields = [];
    for (let key in this.namedTypeFields) {
      let field = this.namedTypeFields[key];
      let type = graphql.getNamedType(field.type);
      if (type instanceof graphql.GraphQLScalarType) {
        fields.push(field);
      }
    }
    return fields;
  }

  buildQuery(params, fields) {
    let q = new Query(this.field.name, params);

    fields =
      fields ||
      this.getScalarFields().map(f => {
        return f.name;
      });

    q.find(fields);
    return q;
  }

  async responseHandler(bot, message) {
    let fields = message.match[3] || null;
    let params = null;
    try {
      params = message.match[6] && eval(`params = {${message.match[6]}}`);
    } catch (e) {}

    bot.reply(message, `loading...`);

    let results = await this.client.sendQuery(this.buildQuery(params, fields));
    bot.reply(
      message,
      `result: ${JSON.stringify(results.data || results, null, " ")}`
    );
  }
}

module.exports = GraphqlQueryTopic;
