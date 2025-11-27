export type Source = {
  url: string;
  title: string;
};

export type Message = {
  id: string;
  createdAt?: Date;
  content: string;
  type: "system" | "human" | "ai" | "function";
  sources?: Source[];
  name?: string;
  function_call?: { name: string };
};

export type Feedback = {
  feedback_id: string;
  score: number;
  comment?: string;
};

export type ModelOptions =
  | "openai/gpt-4.1-mini"
  | "openai/gpt-5-mini"
  | "openai/gpt-5-nano"
  | "anthropic/claude-3-5-haiku-20241022"
  | "google_genai/gemini-2.0-flash";


export enum Theme {
  BLACK = 'BLACK',
  DARK_BLUE = 'DARK_BLUE',
  LIGHT_ORANGE = 'LIGHT_ORANGE',
  WHITE = 'WHITE',
}

export enum AuthProvider {
  GOOGLE = 'Google',
  FACEBOOK = 'Facebook',
  APPLE = 'Apple',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: AuthProvider;
}

export interface KnowledgeChunk {
  id: string;
  content: string;
  keywords: string[];
}

export interface SearchResult {
  chunk: KnowledgeChunk;
  score: number;
}