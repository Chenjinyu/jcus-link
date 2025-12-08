import { LanguageModel } from 'ai';


export interface ModelInfo {
  id: string;
  name: string;
}

/**
 * Available AI models
 */
export const models = [
  { id: 'openai/gpt-4.1-mini', name: 'GPT 4.1 Mini' },
  { id: 'openai/gpt-5-mini', name: 'GPT 5 Mini' },
  { id: 'openai/gpt-5-nano', name: 'GPT 5 Nano' },
  { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' },
  { id: 'google_genai/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'ollama/llama3', name: 'LLaMa3.1:8B' },
  { id: 'ollama/mistral', name: 'Mistral' },
];

export type Model = typeof models[number];

export interface AIModelService {
  name: string;
  initialize(modelId: string): LanguageModel;
  getModels(): ModelInfo[];
}

/**
 * Check if a model ID exists in the available models list
 * @param modelId - The model ID to validate
 * @returns true if model exists, false otherwise
 */
export function isValidModelId(modelId: string): boolean {
  return models.some((model) => model.id === modelId);
}

/**
 * Get model info by ID
 * @param modelId - The model ID
 * @returns ModelInfo if found, undefined otherwise
 */
export function getModelById(modelId: string): ModelInfo | undefined {
  return models.find((model) => model.id === modelId);
}