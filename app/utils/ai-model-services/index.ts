import { modelRegistry } from './ModelRegistry';
import { isValidModelId, getModelById } from './types';

/**
 * Available AI models - dynamically generated from registry
 */
export const models = modelRegistry.getAllModels();

/**
 * 
 type Model = {
  id: 'openai/gpt-4.1-mini' | 'openai/gpt-5-mini' | 'openai/gpt-5-nano' | 'claude-opus-4-20250514' | 'google_genai/gemini-2.0-flash' | 'ollama/llama3' | 'ollama/mistral';
  name: string;
};
above equals below
 */
export type Model = typeof models[number];


/**
 * Initialize a model by ID with validation
 * @throws Error if model ID is invalid
 */
export function initializeModel(modelId: string) {
  if (!isValidModelId(modelId)) {
    throw new Error(`Invalid model ID: "${modelId}". Model not found in available models list.`);
  }
  console.log(`[ai-model-services] Initializing model: ${modelId}`);
  return modelRegistry.initialize(modelId);
}

/**
 * Check if a model ID is valid
 */
export function isValidModel(modelId: string): boolean {
  return modelRegistry.isValidModel(modelId);
}

/**
 * Get model info by ID
 */
export function getModel(modelId: string) {
  return getModelById(modelId);
}

/**
 * Get all models for a specific service
 */
export function getModelsForService(serviceName: string) {
  return modelRegistry.getModelsForService(serviceName);
}