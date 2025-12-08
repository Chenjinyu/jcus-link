import { createOllama } from 'ollama-ai-provider-v2';
import { LanguageModel } from 'ai';
import { AIModelService, ModelInfo } from './types';

export class OllamaService implements AIModelService {
  name = 'Ollama';

  private models: ModelInfo[] = [
    { id: 'ollama/llama3', name: 'LLaMa3.1:8B' },
    { id: 'ollama/mistral', name: 'Mistral' },
  ];

  initialize(modelId: string): LanguageModel {
    const modelName = modelId.split('/')[1];
    
    if (!modelName) {
      throw new Error(`Invalid Ollama model ID: ${modelId}`);
    }

    console.log(`[OllamaService] Initializing model: ${modelName}`);
    const ollama = createOllama({
      baseURL: 'http://localhost:11434/api',
    });
    return ollama(modelName);
  }

  getModels(): ModelInfo[] {
    return this.models;
  }
}