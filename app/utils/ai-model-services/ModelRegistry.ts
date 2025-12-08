import { LanguageModel } from 'ai';
import { AIModelService, ModelInfo, isValidModelId, getModelById } from './types';
import { OpenAIService } from './OpenAIService';
import { OllamaService } from './OllamaService';
// import { ClaudeService } from './ClaudeService';
// import { GeminiService } from './GeminiService';


export class ModelRegistry {
  private services: Map<string, AIModelService> = new Map();

  constructor() {
    this.registerService(new OpenAIService());
    this.registerService(new OllamaService());
    // this.registerService(new ClaudeService());
    // this.registerService(new GeminiService());
  }

  private registerService(service: AIModelService): void {
    this.services.set(service.name.toLowerCase(), service);
  }

  private getServiceByModelId(modelId: string): AIModelService {
    const provider = modelId.split('/')[0].toLowerCase();

    // Map model ID prefixes to service names
    const providerMap: Record<string, string> = {
      openai: 'openai',
      claude: 'claude',
      google_genai: 'google gemini',
      ollama: 'ollama',
    };

    const serviceName = providerMap[provider];
    const service = this.services.get(serviceName);

    if (!service) {
      throw new Error(`Unsupported model provider: ${provider}`);
    }

    return service;
  }

  initialize(modelId: string): LanguageModel {
    // Validate model ID exists in the models list
    if (!isValidModelId(modelId)) {
      throw new Error(
        `Invalid model ID: "${modelId}". Model not found in available models list.`
      );
    }
    console.log(`[ModelRegistry] Initializing model: ${modelId}`);
    const service = this.getServiceByModelId(modelId);
    return service.initialize(modelId);
  }

  getAllModels(): ModelInfo[] {
    const allModels: ModelInfo[] = [];
    this.services.forEach((service) => {
      allModels.push(...service.getModels());
    });
    return allModels;
  }

  getModelsForService(serviceName: string): ModelInfo[] {
    const service = this.services.get(serviceName.toLowerCase());
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }
    return service.getModels();
  }

  /**
   * Check if a model ID is valid
   */
  isValidModel(modelId: string): boolean {
    return isValidModelId(modelId);
  }

  /**
   * Get model info by ID
   */
  getModel(modelId: string): ModelInfo | undefined {
    return getModelById(modelId);
  }
}

export const modelRegistry = new ModelRegistry();