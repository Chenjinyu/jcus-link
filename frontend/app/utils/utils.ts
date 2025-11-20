import { MODEL_CONFIG } from "@/app/configs/config";
import { openAIModel } from "@/app/lib/models/openai";
import { ollamaModel } from "@/app/lib/models/ollama";


export function getModelConfig(provider: string) { 
  return MODEL_CONFIG.find(m => m.provider === provider);
}


export function selectModel(modelName: string){
  const cfg = MODEL_CONFIG.find(
    m => m.modelName === modelName || m.modelVersion === modelName
  );
  if (!cfg) {
    throw new Error(`Model not found: ${modelName}`);
  }
  const { provider, modelVersion, embeddingModel } = cfg;

  if (provider === 'openai') {
    return openAIModel(modelVersion);
  } else if (provider === 'ollama') {
    return ollamaModel(modelVersion);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}