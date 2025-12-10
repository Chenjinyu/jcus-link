import { createProviderRegistry } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider-v2';
/**
 * Available AI models
 */
export const models = [
  { id: 'openai/gpt-4.1-mini', name: 'GPT 4.1 Mini' , available: true},
  { id: 'openai/gpt-5-mini', name: 'GPT 5 Mini' , available: true },
  { id: 'openai/gpt-5-nano', name: 'GPT 5 Nano' , available: true },
  { id: 'anthropic/opus-4-20250514', name: 'Claude 4 Opus' , available: false },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash' , available: false },
  { id: 'ollama/llama3', name: 'Ollama LLaMa3.1:8B' , available: true },
  { id: 'ollama/mistral', name: 'Ollama Mistral' , available: true },
];

/**
 * Get only available models
 */
export const getAvailableModels = () => {
  return models.filter(model => model.available === true);
};

/**
 * Check if a provider has available models
 */
const hasAvailableModels = (provider: string): boolean => {
  return models.some(model => model.id.startsWith(provider) && model.available === true);
}

/**
 * Dynamically create provider registery with only available proviers
 * Create the provider register
 * here is all providers in AI SDK: https://ai-sdk.dev/providers/ai-sdk-providers
 */
const createDynamicRegistery = () => {
  const registerConfig: Record<string, any> = {};

  if (hasAvailableModels('anthropic')) {
    registerConfig['anthropic'] = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }
  if (hasAvailableModels('openai')) {
    registerConfig['openai'] = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  if (hasAvailableModels('google')) {
    registerConfig['google'] = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY || '',
    });
  }
  if (hasAvailableModels('ollama')) {
    registerConfig['ollama'] = createOllama({
      baseURL: process.env.OLLAMA_API_URL || 'http://localhost:11434',
    });
  }
  /**
   * it returns a provider isntance, it has the following methods:
   * languageModel(id: string) => LanguageModel
   * textEmbedding(id: string) => EmbeddingModel
   * imageModel(id: string) => ImageModel
   */
  return createProviderRegistry(registerConfig, { separator: '/' });
}
export const register = createDynamicRegistery();

export let PROMPT_DEFAULT = `You are a helpful assistant. Check your knowledge base before answering any questions.
Only respond to questions using information from tool calls.
if no relevant information is found in the tool calls, respond, "Sorry, I don't know. There is no relevant infomration in my knowledge base."`

export let PROMPT_NEW = `You are a helpful assistant. Check your knowledge base before answering any questions`