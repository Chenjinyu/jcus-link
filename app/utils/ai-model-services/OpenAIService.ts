import { openai } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';
import { AIModelService, ModelInfo } from './types';

export class OpenAIService implements AIModelService {
  name = 'OpenAI';

  private models: ModelInfo[] = [
    { id: 'openai/gpt-4.1-mini', name: 'GPT 4.1 Mini' },
    { id: 'openai/gpt-5-mini', name: 'GPT 5 Mini' },
    { id: 'openai/gpt-5-nano', name: 'GPT 5 Nano' },
  ];

  initialize(modelId: string): LanguageModel {
    const modelName = modelId.split('/')[1];
    
    if (!modelName) {
      throw new Error(`Invalid OpenAI model ID: ${modelId}`);
    }

    console.log(`[OpenAIService] Initializing model: ${modelName}`);
    return openai(modelName);
  }

  getModels(): ModelInfo[] {
    return this.models;
  }
}