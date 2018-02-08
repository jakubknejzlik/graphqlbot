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
class NotFoundTopic extends Topic_1.Topic {
    constructor() {
        super("NotFound", "");
    }
    getPatterns() {
        return __awaiter(this, void 0, void 0, function* () {
            return [".*"];
        });
    }
    startInteraction(message, convo) {
        return __awaiter(this, void 0, void 0, function* () {
            convo.say(`I don't understand this, sorry. You can always write \`help\` for getting list of available actions.`);
        });
    }
}
exports.NotFoundTopic = NotFoundTopic;
//# sourceMappingURL=NotFoundTopic.js.map