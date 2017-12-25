import * as inflection from 'inflection'
import { Message, Conversation } from 'botkit';

export class TopicInteraction {
  message: string
  response?: string

  constructor(message: string, response?: string) {
    this.message = message
    this.response = response
  }

  async apply(convo: Conversation<Message>): Promise<TopicInteractionResponse | null> {
    return new TopicInteractionResponse(this.response || "empty interaction")
  }
}

export class TopicInteractionResponse extends String {
}

export class TopicInteractionQuestion extends TopicInteraction {
  async apply(convo: Conversation<Message>): Promise<TopicInteractionResponse | null> {
    return new Promise<TopicInteractionResponse | null>((resolve, reject) => {
      convo.ask(this.message,(response_message,convo) => {
        const text = response_message.text
        if (typeof text === 'undefined') {
          reject(new Error('empty response'))
        }
        resolve(new TopicInteractionQuestionResponse(text as string))
      })
    })
  }
}

export class TopicInteractionQuestionResponse extends TopicInteractionResponse {
  text: string  
  constructor(text: string) {
    super()
    this.text = text
  }

  toString(): string {
    return this.text
  }
}