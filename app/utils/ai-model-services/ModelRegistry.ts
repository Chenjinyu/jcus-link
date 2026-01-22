import { createProviderRegistry } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOllama } from 'ollama-ai-provider-v2';
import { envConfig } from '@/app/configs/environment';

/**
 * Available AI models
 */
export const models = [
  { id: 'openai/gpt-4.1-mini', name: 'GPT 4.1 Mini', available: false, env: 'production' },
  { id: 'openai/gpt-5-mini', name: 'GPT 5 Mini', available: false, env: 'production' },
  { id: 'openai/gpt-5-nano', name: 'GPT 5 Nano', available: true, env: 'production' },
  { id: 'anthropic/opus-4-20250514', name: 'Claude 4 Opus', available: false, env: 'production' },
  { id: 'google/gemini-2.0-flash', name: 'Gemini 2.0 Flash', available: true, env: '' },
  { id: 'ollama/llama3.1:8b', name: 'Ollama LLaMa3.1:8B', available: true, env: 'local' },
  { id: 'ollama/mistral:latest', name: 'Ollama Mistral', available: true, env: 'local' },
];

/**
 * Get only available models
 */
export const getAvailableModels = () => {
  return models.filter(
    model =>
      model.available === true &&
      (model.env === '' || model.env === envConfig.env)
  );
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
      baseURL: process.env.OLLAMA_API_URL || 'http://localhost:11434/api',
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
The conversation has to flow into the questions about the web application author, if the client user ask questions are not related to the web application author, then respond: "Do you have any questions about the JC?" otherwise, respond questions using information from tool calls.
if no relevant information is found in the tool calls, respond, "Sorry, I don't know. There is no relevant infomration in my knowledge base."`;

export const PROMPT_NEW = `You are a helpful assistant, help to answer the questions of the users have.  
Check your knowledge base with supabase database before answering any questions\n`;

export const USER_BASIC_INFO = `${PROMPT_NEW} I am 15 year experiences as software engineer, and an Asian-American citizen`;
export const RESUME_BASIC_INFO = `${USER_BASIC_INFO}, My experience and skills have been stored into supabase vector database, based on the user provided the resume info to query the supabase database and get the releated information back.`;
