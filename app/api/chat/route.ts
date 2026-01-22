import { 
  convertToModelMessages, 
  stepCountIs, 
  streamText,
  tool,
  UIMessage
} from 'ai';
import { z } from 'zod';
import { envConfig } from '@/app/configs/environment';
import { 
  register, 
  PROMPT_DEFAULT,
  USER_BASIC_INFO,
  RESUME_BASIC_INFO,
} from '@/app/utils/ai-model-services/ModelRegistry';
import {
  getAllWorkExperience,
  searchSimilarContent,
  getMatchedResumes,
} from '@/app/utils/mcp-http-client';
import {
  resolveInputType,
  SupportedInputType,
  getFilename,
  isHttpUrl,
  extractBase64FromDataUrl,
  extractFirstUrl,
  extractUserQuery,
  getMessageAttachments
} from './chat-utils';

console.log(`[INIT] Chat route loaded in ${envConfig.env} environment`);
export const maxDuration = 60; // Increased for MCP operations

export async function POST(req: Request) {
  if (envConfig.debugMode) {
    console.log(`[CHAT] POST /api/chat called in ${envConfig.env} environment`);
  }

  try {
    const body = await req.json();
    const messages = body.messages || [];
    const selectedModel = body.selectedModel || envConfig.defaultModel;

    if (messages.length === 0) {
      throw new Error('No messages provided');
    }

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userQuery = extractUserQuery(lastUserMessage);
    const attachments = lastUserMessage ? getMessageAttachments(lastUserMessage) : [];
    const urlFromText = extractFirstUrl(userQuery);

    // Check for URL and attached files conflict
    if (urlFromText && attachments.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Cannot Determine Input Type',
          details: 'Cannot determine whether to use the URL or attached file. Please either remove the URL from the message or remove the attachment.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Check for multiple files
    if (attachments.length > 1) {
      return new Response(
        JSON.stringify({
          error: 'Cannot Support Multi-Files',
          details: 'Only support uploading a single file. Please remove extra attachments and keep one file.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Requirement 4 & 5: Determine inputType and prepare inputData
    let inputType: SupportedInputType | 'file' | null = null;
    let inputData = '';
    let filename = '';
    const uploadedFile = attachments.length > 0 ? attachments[0] : null;

    if (urlFromText) {
      // URL provided in message
      if (!isHttpUrl(urlFromText)) {
        return new Response(
          JSON.stringify({
            error: 'Invalid URL input',
            details: 'Provide a valid http(s) URL.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      inputType = 'url';
      inputData = urlFromText;
      filename = getFilename({ url: urlFromText });
    } else if (uploadedFile) {
      // File attached
      inputType = resolveInputType(uploadedFile);
      if (!inputType) {
        return new Response(
          JSON.stringify({
            error: 'Unsupported file type',
            details: 'Supported types: pdf, doc, docs, txt, html.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const dataUrl = typeof uploadedFile?.url === 'string' ? uploadedFile.url : '';
      const base64 = dataUrl ? extractBase64FromDataUrl(dataUrl) : null;
      if (!base64) {
        return new Response(
          JSON.stringify({
            error: 'Invalid file payload',
            details: 'Expected a base64 data URL for file uploads.',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      inputData = base64;
      filename = getFilename(uploadedFile);
    }

    const mcpResponse = streamText({
      model: register.languageModel(selectedModel),
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
      system: PROMPT_DEFAULT,
      tools: {
        getAllWorkExperience: tool({
          description: `${USER_BASIC_INFO}, When the user asks the job experience and the skills, 
          use this tool without asking for confirmation, and give the user the organized response`,
          inputSchema: z.object({
            content: z.string().describe('The message sends from user.'),
          }),
          execute: async({content}) => {
            console.log('[DEBUG]route.ts.POST.tool.getAllWorkExperience with content:', { userQuery });
            try{
              console.log('[DEBUG]route.ts.POST.tool.getAllWorkExperience calling searchSimilarContent()...');
              const result = await getAllWorkExperience(content);
              console.log('[DEBUG]route.ts.POST.tool.getAllWorkExperience result:', result);
              return result;
            }catch (error) {
              console.error('[ERROR]route.ts.POST.tool.getAllWorkExperience failed:', error);
              return {
                error: 'Failed to search and get all work experiences',
                details: error instanceof Error ? error.message : String(error)
              };
            }
          }
        }),
        searchSimilarContent: tool({
          description: `${USER_BASIC_INFO}. Use this tool ONLY when the user asks about work experience, skills, or certifications. Extract keywords from the user's question and search for matching content in the database. Return organized results without asking for confirmation.`,
          inputSchema: z.object({
            inputText: z.string().describe('Keywords or phrases from the user query about work experience, skills, or certifications'),
          }),
          execute: async({inputText}) => {
            console.log('[DEBUG]route.ts.POST.tool.searchSimilarContent with inputText:', { userQuery });
            try{
              console.log('[DEBUG]route.ts.POST.tool.searchSimilarContent calling searchSimilarContent()...');
              const result = await searchSimilarContent(inputText);
              console.log('[DEBUG]route.ts.POST.tool.searchSimilarContent result:', result);
              return result;
            }catch (error) {
              console.error('[ERROR]route.ts.POST.tool.searchSimilarContent failed:', error);
              return {
                error: 'Failed to search similarity content',
                details: error instanceof Error ? error.message : String(error)
              };
            }
          }
        }),
        getMatchedResumes: tool({
          description: `${RESUME_BASIC_INFO}, When the user attaches a file or paste a url link in the chat window, 
          means the user wants to get the latest resume regarding the web application auther based on the job description the user provides
          use this tool without asking for confirmation`,
          inputSchema: z.object({}),
          execute: async() => {
            console.log('[DEBUG]route.ts.POST.tool.getMatchedResumes', { userQuery, inputType, inputData: inputData.substring(0, 50) + '...' });
            if (!inputType || !inputData) {
              return {
                error: 'No job description provided. Please upload a file or provide a URL.'
              };
            }
            const result = await getMatchedResumes(inputData, inputType as SupportedInputType, filename);
            return result;
          }
        }),
      }
    });
    return mcpResponse.toUIMessageStreamResponse();

  } catch (error) {
    console.error('[ERROR] POST /api/chat:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: errorMsg,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
