export type OllamaRole = 'system' | 'user' | 'assistant' | 'tool';

export interface OllamaMessage {
  role: OllamaRole;
  content: string;
  images?: string[];
  tool_calls?: unknown[];
}

export interface ChatRequestInput {
  model?: string;
  messages: OllamaMessage[];
  format?: 'json' | Record<string, unknown>;
  options?: Record<string, unknown>;
  keep_alive?: string | number;
  think?: boolean | 'low' | 'medium' | 'high' | 'max';
}

export interface GenerateRequestInput {
  model?: string;
  prompt: string;
  images?: string[];
  format?: 'json' | Record<string, unknown>;
  options?: Record<string, unknown>;
  keep_alive?: string | number;
  system?: string;
  think?: boolean | 'low' | 'medium' | 'high' | 'max';
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: 'assistant';
    content: string;
    thinking?: string;
    tool_calls?: unknown[];
    images?: string[];
  };
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  thinking?: string;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaTagsResponse {
  models: Array<{
    name: string;
    modified_at?: string;
    size?: number;
    digest?: string;
    details?: Record<string, unknown>;
  }>;
}
