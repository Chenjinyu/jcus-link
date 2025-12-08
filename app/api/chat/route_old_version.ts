// import { createResource } from '@/db/actions/resources';
// import { deepinfra } from '@ai-sdk/deepinfra';
// import {
//   convertToModelMessages,
//   streamText,
//   tool,
//   UIMessage,
//   stepCountIs,
// } from 'ai';
// import { z } from 'zod';
// import { findRelevantContent } from '@/app/lib/embedding';
// import { ollamaModel } from '@/app/lib/models/ollama';
// import { selectModel } from '@/app/utils/utils';
// import { PROMPT_NEW, PROMPT_DEFAULT } from '@/app/configs/config';

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { 
//     messages, 
//     model: selectedModel, 
//     webSearch 
//   }: { 
//     messages: UIMessage[];
//     model?: string;
//     webSearch?: boolean;
//   } = await req.json();

//   console.log('[DEBUG] Incoming request:', {
//     messageCount: messages.length,
//     selectedModel,
//     webSearch
//   });

//   const lastMessage = messages[messages.length - 1];
//   console.log('Last message parts:', lastMessage)
//   // const modelSelectionPart = lastMessage.parts.find(
//   //   part => part.type === 'model-selection'
//   // );
//   // const selectedModel = modelSelectionPart?.metadata?.model || 'gpt-4o';
//   // Destructure your custom data property
//   // type MessageWithMetadata = UIMessage & {
//   //   metadata?: {
//   //     selectedModelName?: string;
//   //     [key: string]: any;
//   //   };
//   // };

//   // Use the model from request body, fallback to metadata, then default
//   const modelToUse = selectedModel || 'gpt-4o';
//   console.log('[DEBUG] Using model:', modelToUse);

//   const result = streamText({
//     model: selectModel(modelToUse),
//     messages: convertToModelMessages(messages),
//     stopWhen: stepCountIs(5),
//     system: PROMPT_DEFAULT,
//     tools: {
//       addResource: tool({
//         description: `add a resource to your knowledge base.
//           If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
//         inputSchema: z.object({
//           content: z
//             .string()
//             .describe('the content or resource to add to the knowledge base'),
//         }),
//         execute: async ({ content }) => { 
//           console.log('[DEBUG]route.ts.POST.tool.addResource with content:', { content });
//           const reps = await createResource({ content })
//           console.log('[DEBUG]route.ts.POST.tool.addResource result:', { reps });
//         },
//       }),
//       getInformation: tool({
//         description: `get information from your knowledge base to answer questions.`,
//         inputSchema: z.object({
//           question: z.string().describe('the users question'),
//         }),
//         execute: async ({ question }) => {
//           console.log('[DEBUG]route.ts.POST.tool.getInformation with content:', { question });
//           const result = await findRelevantContent(question);
//           console.log('[DEBUG]route.ts.POST.tool.getInformation returns:', result);
//           return result;
//         }
//       }),
//       // Optional: Add web search tool if webSearch is enabled
//       ...(webSearch ? {
//         webSearch: tool({
//           description: `Search the web for current information. Use this when the user asks about recent events, news, or information that might not be in your training data.`,
//           inputSchema: z.object({
//             query: z.string().describe('the search query'),
//           }),
//           execute: async ({ query }) => {
//             console.log('[DEBUG] route.ts.POST.tool.webSearch with query:', { query });
//             // Implement your web search logic here
//             // For now, return a placeholder
//             return { 
//               message: 'Web search is enabled but not yet implemented',
//               query 
//             };
//           }
//         }),
//       } : {}),
//     },
//     onError: (error) => {
//       console.error('[DEBUG][POST] Error during AI processing:', error);
//     }
//   });

//   return result.toUIMessageStreamResponse();
// }