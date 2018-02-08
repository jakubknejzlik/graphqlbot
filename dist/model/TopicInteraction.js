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
class TopicInteraction {
    constructor(message, response) {
        this.message = message;
        this.response = response;
    }
    apply(convo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new TopicInteractionResponse(this.response || "empty interaction");
        });
    }
}
exports.TopicInteraction = TopicInteraction;
class TopicInteractionResponse extends String {
}
exports.TopicInteractionResponse = TopicInteractionResponse;
class TopicInteractionQuestion extends TopicInteraction {
    apply(convo) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                convo.ask(this.message, (response_message, convo) => {
                    const text = response_message.text;
                    if (typeof text === "undefined") {
                        reject(new Error("empty response"));
                    }
                    resolve(new TopicInteractionQuestionResponse(text));
                });
            });
        });
    }
}
exports.TopicInteractionQuestion = TopicInteractionQuestion;
class TopicInteractionQuestionResponse extends TopicInteractionResponse {
    constructor(text) {
        super();
        this.text = text;
    }
    toString() {
        return this.text;
    }
}
exports.TopicInteractionQuestionResponse = TopicInteractionQuestionResponse;
//# sourceMappingURL=TopicInteraction.js.map