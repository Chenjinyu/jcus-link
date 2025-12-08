// import { anthropic } from '@ai-sdk/anthropic';
// import { LanguageModel } from 'ai';
// import { AIModelService, ModelInfo } from './types';

// export class ClaudeService implements AIModelService {
//   name = 'Claude';

//   private models: ModelInfo[] = [
//     { id: 'claude-opus-4-20250514', name: 'Claude 4 Opus' },
//   ];

//   initialize(modelId: string): LanguageModel {
//     if (!modelId) {
//       throw new Error(`Invalid Claude model ID: ${modelId}`);
//     }

//     console.log(`[ClaudeService] Initializing model: ${modelId}`);
//     return anthropic(modelId);
//   }

//   getModels(): ModelInfo[] {
//     return this.models;
//   }
// }