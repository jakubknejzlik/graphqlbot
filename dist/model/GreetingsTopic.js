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
class GreetingsTopic extends Topic_1.Topic {
    constructor() {
        super("Greetings", "");
    }
    getPatterns() {
        return __awaiter(this, void 0, void 0, function* () {
            return ["hi", "hello", "ciao", "greetings"];
        });
    }
    getInteractionForMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return new TopicInteraction_1.TopicInteraction(message, `Hello!`);
        });
    }
}
exports.GreetingsTopic = GreetingsTopic;
//# sourceMappingURL=GreetingsTopic.js.map