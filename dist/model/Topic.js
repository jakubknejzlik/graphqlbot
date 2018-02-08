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
const inflection = require("inflection");
class Topic {
    constructor(name, description) {
        this.name = name;
        this.description = description;
    }
    getCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            return [this.getCallName()];
        });
    }
    getCallName() {
        return inflection.humanize(inflection.underscore(this.name)).toLowerCase();
    }
    getPatterns() {
        return __awaiter(this, void 0, void 0, function* () {
            return [`^${this.getCallName()}$`];
        });
    }
    validate(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const patterns = yield this.getPatterns();
            for (let pattern of patterns) {
                // console.log(`validate?? ${pattern} => ${message}`);
                const match = message.match(pattern);
                if (match !== null) {
                    return match;
                }
            }
            return null;
        });
    }
    startInteraction(message, convo) {
        return __awaiter(this, void 0, void 0, function* () {
            convo.say({ text: `Not implemented` });
        });
    }
}
exports.Topic = Topic;
//# sourceMappingURL=Topic.js.map