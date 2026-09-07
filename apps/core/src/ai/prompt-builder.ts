import type { OllamaMessage } from './types.js';

/**
 * A fluent, chainable API designed to simplify prompt orchestrations,
 * dynamic contextual additions, and conversation histories.
 */
export class PromptBuilder {
  private messages: OllamaMessage[] = [];

  /** Adds a foundational system configuration message */
  system(content: string): this {
    this.messages.push({ role: 'system', content });
    return this;
  }

  /** Adds an incoming human message stream with optional base64 image hashes */
  user(content: string, images?: string[]): this {
    this.messages.push({
      role: 'user',
      content,
      ...(images !== undefined ? { images } : {}),
    });
    return this;
  }

  /** Append tracking records from past agent inferences */
  assistant(content: string): this {
    this.messages.push({ role: 'assistant', content });
    return this;
  }

  /** Injects tool resolution hooks */
  tool(content: string): this {
    this.messages.push({ role: 'tool', content });
    return this;
  }

  /** Dynamically extends history array records from prior stores */
  extend(messages: OllamaMessage[]): this {
    this.messages.push(...messages);
    return this;
  }

  /** Wipes out current message buffer tracks */
  clear(): this {
    this.messages = [];
    return this;
  }

  /** Produces the fully mapped message output block */
  build(): OllamaMessage[] {
    return [...this.messages];
  }
}
