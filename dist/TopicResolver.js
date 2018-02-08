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
const NotFoundTopic_1 = require("./model/NotFoundTopic");
const GreetingsTopic_1 = require("./model/GreetingsTopic");
const HelpTopic_1 = require("./model/HelpTopic");
class TopicResolver {
    constructor(topics) {
        this.topics = [new GreetingsTopic_1.GreetingsTopic()];
        this.topics = this.topics.concat(topics);
        this.topics.push(new HelpTopic_1.HelpTopic(this.topics));
    }
    getTopicForMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let topic of this.topics) {
                if (typeof message.text !== "undefined" &&
                    (yield topic.validate(message.text))) {
                    return topic;
                }
            }
            return new NotFoundTopic_1.NotFoundTopic();
        });
    }
}
exports.TopicResolver = TopicResolver;
// module.exports = ConversationResolver;
//# sourceMappingURL=TopicResolver.js.map