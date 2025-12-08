// import { google } from '@ai-sdk/google';
// import { LanguageModel } from 'ai';
// import { AIModelService, ModelInfo } from './types';

// export class GeminiService implements AIModelService {
//   name = 'Google Gemini';

//   private models: ModelInfo[] = [
//     { id: 'google_genai/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
//   ];

//   initialize(modelId: string): LanguageModel {
//     const modelName = modelId.split('/')[1];
    
//     if (!modelName) {
//       throw new Error(`Invalid Gemini model ID: ${modelId}`);
//     }

//     console.log(`[GeminiService] Initializing model: ${modelName}`);
//     return google(modelName);
//   }

//   getModels(): ModelInfo[] {
//     return this.models;
//   }
// }