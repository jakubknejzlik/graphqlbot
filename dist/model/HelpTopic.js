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
const Topic_1 = require("./Topic");
const TopicInteraction_1 = require("./TopicInteraction");
class HelpTopic extends Topic_1.Topic {
    constructor(topics) {
        super("Help", "");
        this.topics = topics;
    }
    getInteractionForMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let commands = [];
            for (let topic of this.topics) {
                commands = commands.concat(yield topic.getCommands());
            }
            return new TopicInteraction_1.TopicInteraction(message.text, `You can call these functions: \`\`\`${commands.join("\n")}\`\`\``);
        });
    }
}
exports.HelpTopic = HelpTopic;
//# sourceMappingURL=HelpTopic.js.map