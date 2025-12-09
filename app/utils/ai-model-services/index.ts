import { modelRegistry } from './ModelRegistry';
import { isValidModelId, getModelById } from './types';

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