import { envConfig } from '@/app/configs/environment';
import { LanguageModel } from 'ai';


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


// Filter models based on environment
export function getAvailableModels(){
  if (envConfig.enableLocalOllama) {
    // Local environment: show only Ollama models
    return models.filter(m => m.id.startsWith('ollama/'));
  }
  // Other environments: show all models except Ollama
  return models.filter(m => !m.id.startsWith('ollama/'));
}
/**
 * 
 type Model = {
  id: 'openai/gpt-4.1-mini' | 'openai/gpt-5-mini' | 'openai/gpt-5-nano' | 'claude-opus-4-20250514' | 'google_genai/gemini-2.0-flash' | 'ollama/llama3' | 'ollama/mistral';
  name: string;
};
above equals below
 */
export type Model = typeof models[number];
export interface ModelInfo {
  id: string;
  name: string;
}

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
  const availableModels = getAvailableModels();
  return availableModels.some((model) => model.id === modelId);
}

/**
 * Get model info by ID
 * @param modelId - The model ID
 * @returns ModelInfo if found, undefined otherwise
 */
export function getModelById(modelId: string): ModelInfo | undefined {
  const availableModels = getAvailableModels();
  return availableModels.find((model) => model.id === modelId);
}