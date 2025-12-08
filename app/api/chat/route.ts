import { createResource } from '@/db/actions/resources';
import {
  convertToModelMessages,
  streamText,
  tool,
  UIMessage,
  stepCountIs,
} from 'ai';
import { z } from 'zod';
// import { openai } from '@ai-sdk/openai';
import { initializeModel, isValidModel, getModel  } from '@/app/utils/ai-model-services';
import { findRelevantContent } from '@/app/lib/embedding';
import { PROMPT_DEFAULT } from '@/app/configs/config';

console.log('[INIT] route.ts file loaded');
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('🚀 POST /api/chat called');
  
  // try {
  //   const body = await req.json();
  //   console.log('[DEBUG] Request body keys:', Object.keys(body));

  //   // const { messages, selectedModel = 'openai/gpt-4.1-mini', webSearch } = body;

  //   const messages = body.messages as UIMessage[];
  //   const selectedModel = body.selectedModel || 'openai/gpt-4.1-mini';
  //   const webSearch = body.webSearch || false;

  //   console.log('[DEBUG] Extracted:', {
  //     messageCount: messages?.length,
  //     selectedModel,
  //     webSearch,
  //   });

  //   // ✅ Validate selected model
  //   if (!isValidModel(selectedModel)) {
  //     console.error('[ERROR] Invalid model ID:', selectedModel);
  //     const model = getModel(selectedModel);
  //     return new Response(
  //       JSON.stringify({
  //         error: 'Invalid model',
  //         details: `Model "${selectedModel}" is not in the available models list`,
  //         availableModels: ['openai/gpt-4.1-mini', 'openai/gpt-5-mini', 'claude-opus-4-20250514', 'google_genai/gemini-2.0-flash', 'ollama/llama3', 'ollama/mistral'],
  //       }),
  //       { status: 400, headers: { 'Content-Type': 'application/json' } }
  //     );
  //   }

  //   // // Check for attachments in messages
  //   // if (messages.length > 0) {
  //   //   const lastMessage = messages[messages.length - 1];
      
  //   //   // Access attachments from the message data structure
  //   //   // only check the last message of attachments.
  //   //   const attachments = (lastMessage as any).experimental_attachments || [];
      
  //   //   console.log('[DEBUG] Last message attachments:', {
  //   //     hasAttachments: attachments.length > 0,
  //   //     attachmentCount: attachments.length,
  //   //   });

  //   //   // Process attachments if present
  //   //   if (attachments.length > 0) {
  //   //     for (const attachment of attachments) {
  //   //       console.log('[DEBUG] Processing attachment:', {
  //   //         name: attachment.name,
  //   //         contentType: attachment.contentType,
  //   //         size: typeof attachment.data === 'string' 
  //   //           ? attachment.data.length 
  //   //           : attachment.data?.length || 'unknown',
  //   //       });

  //   //       try {
  //   //         // Handle file based on type
  //   //         if (attachment.contentType?.startsWith('image/')) {
  //   //           console.log('[DEBUG] Image attachment detected:', attachment.name);
  //   //           // Process image files
  //   //           // You can save, analyze, or process the image here
              
  //   //         } else if (attachment.contentType?.startsWith('text/')) {
  //   //           console.log('[DEBUG] Text attachment detected:', attachment.name);
  //   //           // Process text files
  //   //           const textContent = typeof attachment.data === 'string' 
  //   //             ? attachment.data 
  //   //             : Buffer.from(attachment.data).toString('utf-8');
  //   //           console.log('[DEBUG] Text content preview:', textContent.substring(0, 200));
              
  //   //           // Example: Save to knowledge base
  //   //           if (textContent) {
  //   //             await createResource({ content: textContent });
  //   //           }
              
  //   //         } else if (attachment.contentType === 'application/pdf') {
  //   //           console.log('[DEBUG] PDF attachment detected:', attachment.name);
  //   //           // Process PDF files
  //   //           // You might want to use a PDF parser library here
              
  //   //         } else {
  //   //           console.log('[DEBUG] Unknown attachment type:', attachment.contentType);
  //   //         }
  //   //       } catch (attachmentError) {
  //   //         console.error('[ERROR] Failed to process attachment:', attachmentError);
  //   //       }
  //   //     }
  //   //   }
  //   // }

  //   // // Validate messages
  //   // if (!messages || !Array.isArray(messages) || messages.length === 0) {
  //   //   console.error('[ERROR] Invalid messages format');
  //   //   return new Response(
  //   //     JSON.stringify({ error: 'Messages must be an array' }),
  //   //     { status: 400, headers: { 'Content-Type': 'application/json' } }
  //   //   );
  //   // }

  //   // Model mapping

  //   const result = streamText({
  //     model: initializeModel(selectedModel),
  //     messages: convertToModelMessages(messages),
  //     stopWhen: stepCountIs(5),
  //     system: PROMPT_DEFAULT,
  //     // tools: {
  //     //   addResource: tool({
  //     //     description: `add a resource to your knowledge base.`,
  //     //     inputSchema: z.object({
  //     //       content: z.string().describe('the content to add'),
  //     //     }),
  //     //     execute: async ({ content }) => {
  //     //       console.log('[DEBUG] addResource:', content);
  //     //       try {
  //     //         await createResource({ content });
  //     //         return { success: true };
  //     //       } catch (error) {
  //     //         console.error('[ERROR] addResource:', error);
  //     //         return { success: false, error: String(error) };
  //     //       }
  //     //     },
  //     //   }),
  //     //   getInformation: tool({
  //     //     description: `get information from your knowledge base.`,
  //     //     inputSchema: z.object({
  //     //       question: z.string().describe('the question'),
  //     //     }),
  //     //     execute: async ({ question }) => {
  //     //       console.log('[DEBUG] getInformation:', question);
  //     //       try {
  //     //         return await findRelevantContent(question);
  //     //       } catch (error) {
  //     //         console.error('[ERROR] getInformation:', error);
  //     //         return { error: String(error) };
  //     //       }
  //     //     },
  //     //   }),
  //     //   ...(webSearch ? {
  //     //     webSearch: tool({
  //     //       description: `Search the web for current information.`,
  //     //       inputSchema: z.object({
  //     //         query: z.string().describe('search query'),
  //     //       }),
  //     //       execute: async ({ query }) => {
  //     //         console.log('[DEBUG] webSearch:', query);
  //     //         return { message: 'Web search not implemented', query };
  //     //       },
  //     //     }),
  //     //   } : {}),
  //     // },
  //   });

  //   console.log('[DEBUG] ✅ Streaming response');
  //   return result.toUIMessageStreamResponse();
  // } catch (error) {
  //   console.error('[ERROR] POST /api/chat:', error);
  //   const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
  //   return new Response(
  //     JSON.stringify({
  //       error: 'Internal Server Error',
  //       details: errorMsg,
  //     }),
  //     { status: 500, headers: { 'Content-Type': 'application/json' } }
  //   );
  // }
}