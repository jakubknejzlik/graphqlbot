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
class GraphQLBotConversation {
    constructor(bot, resolver) {
        this.bot = bot;
        this.resolver = resolver;
    }
    start(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const convo = yield this.startConversation(message);
            try {
                const topic = yield this.resolver.getTopicForMessage(message);
                let interaction = yield topic.getInteractionForMessage(message);
                let response = yield interaction.apply(convo);
                if (response !== null) {
                    convo.say(response.toString());
                }
            }
            catch (err) {
                convo.say(`Failed to get response \`\`\`${err.message} ${err.stack}\`\`\``);
            }
            // let anythingElseInteraction = new TopicInteraction("Anything else?")
            // const res = await anythingElseInteraction.apply(convo)
            // if (res == "yes") {
            //   convo.transitionTo("completed","Ask again")
            // }else {
            // convo.addMessage("Good bye!","completed")
            // }
        });
    }
    startConversation(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.bot.startConversation(message, function (err, convo) {
                    if (err)
                        return reject(err);
                    resolve(convo);
                });
            });
        });
    }
    processMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
exports.GraphQLBotConversation = GraphQLBotConversation;
//# sourceMappingURL=GraphQLBotConversation.js.map