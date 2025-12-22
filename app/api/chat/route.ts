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
import { envConfig } from '@/app/configs/environment';
import { register, PROMPT_DEFAULT } from '@/app/utils/ai-model-services/ModelRegistry';
import {
  uploadJobDescriptionToMCP,
  searchMatchingResumes,
  analyzeJobDescription,
  generateResume,
  selectMCPToolsForQuery,
} from '@/app/utils/mcp-client-sdk';

console.log(`[INIT] Chat route loaded in ${envConfig.env} environment`);
export const maxDuration = 60; // Increased for MCP operations

export async function POST(req: Request) {
  if (envConfig.debugMode) {
    console.log(`[CHAT] POST /api/chat called in ${envConfig.env} environment`);
  }

  try {
    const body = await req.json();
    console.log('[DEBUG] Request body keys:', Object.keys(body));

    const messages = body.messages as UIMessage[];
    let selectedModel = body.selectedModel || envConfig.defaultModel;
    const webSearch = body.webSearch || false;

    if (messages.length == 0) {
      throw new Error('No messages provided');
    }
    // Get the last user message to analyze for MCP tool selection
    const lastUserMessage = messages
      .filter((m) => m.role === 'user')
      .pop();

    const attachments = (lastUserMessage as any)?.experimental_attachments || [];

    console.log('[DEBUG] Last User Message Attachments: ', {
      hasAttachments: attachments.length > 0,
      attachmentCount: attachments.length,
    });

    const userQuery = lastUserMessage?.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join(' ') || '';
    // const userQuery = lastUserMessage?.parts?.toString() || ''; 

    // Intelligently select MCP tools based on user query
    const mcpToolSelection = await selectMCPToolsForQuery(userQuery);

    if (envConfig.debugMode) {
      console.log('[MCP] Tool selection:', mcpToolSelection);
    }

    // Check for file attachments in the last message
    let hasJobDescriptionFiles = false;
    const uploadedJobIds: string[] = [];

    if (lastUserMessage && (lastUserMessage as any).files?.length > 0) {
      const files = (lastUserMessage as any).files;
      hasJobDescriptionFiles = true;

      // Process files that look like job descriptions
      for (const file of files) {
        try {
          // Check if file is a job description type (PDF, DOCX, etc.)
          const isJobDescriptionFile =
            file.mediaType?.includes('pdf') ||
            file.mediaType?.includes('word') ||
            file.mediaType?.includes('text') ||
            file.mediaType?.includes('html') ||
            file.mediaType?.includes('xml') ||
            file.filename?.match(/\.(pdf|doc|docx|txt|md|html|xml)$/i);

          if (isJobDescriptionFile) {
            console.log(`[MCP] Processing job description file: ${file.filename}`);

            // Extract file data from data URL if present
            let fileData: Buffer | string = '';
            let inputType: 'text' | 'file' | 'url' = 'file';

            if (file.url && file.url.startsWith('data:')) {
              // Extract base64 data from data URL
              const base64Data = file.url.split(',')[1];
              fileData = Buffer.from(base64Data, 'base64');
            } else if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
              inputType = 'url';
              fileData = file.url;
            } else {
              // Try to get text content if it's a text file
              if (file.mediaType?.startsWith('text/')) {
                inputType = 'text';
                fileData = file.url || '';
              } else {
                continue; // Skip if we can't process it
              }
            }

            // Upload to MCP server
            const uploadResult = await uploadJobDescriptionToMCP(
              fileData,
              file.filename || 'job_description',
              inputType
            );

            if (uploadResult.job_id) {
              uploadedJobIds.push(uploadResult.job_id);
              console.log(`[MCP] Successfully uploaded job description: ${uploadResult.job_id}`);
            }
          }
        } catch (fileError) {
          console.error('[MCP] Error processing file:', fileError);
        }
      }
    }

    // Build system prompt with MCP context
    let systemPrompt = PROMPT_DEFAULT;
    if (hasJobDescriptionFiles && uploadedJobIds.length > 0) {
      systemPrompt += `\n\nYou have access to ${uploadedJobIds.length} uploaded job description(s) via MCP tools. Use the MCP tools to analyze, search, and generate resumes based on these job descriptions.`;
    }

    // Define MCP tools for the AI to use
    const mcpTools: Record<string, any> = {};

    // Add upload_job_description tool if job description files were detected
    if (mcpToolSelection.tools.includes('upload_job_description') || hasJobDescriptionFiles) {
      mcpTools.uploadJobDescription = tool({
        description: `Upload a job description from text, file (base64), or URL to the MCP server for processing and matching. Use this when the user provides a job description or job posting.`,
        inputSchema: z.object({
          input_data: z.string().describe('Job description text, base64-encoded file, or URL'),
          input_type: z.enum(['text', 'file', 'url']).describe('Type of input'),
          filename: z.string().optional().describe('Filename (required for file type)'),
        }),
        execute: async ({ input_data, input_type, filename }) => {
          try {
            const result = await uploadJobDescriptionToMCP(
              input_data,
              filename || 'job_description',
              input_type
            );
            return result;
          } catch (error) {
            return {
              error: error instanceof Error ? error.message : 'Failed to upload job description'
            };
          }
        },
      });
    }

    // Add search_matching_resumes tool
    if (mcpToolSelection.tools.includes('search_matching_resumes')) {
      mcpTools.searchMatchingResumes = tool({
        description: `Search for resumes that match a job description using vector similarity search. Use this to find candidates from the developer background database stored in Supabase.`,
        inputSchema: z.object({
          job_description: z.string().describe('The job description text to match against'),
          top_k: z.number().int().min(1).max(20).default(5).describe('Number of top matches to return'),
        }),
        execute: async ({ job_description, top_k }) => {
          try {
            const result = await searchMatchingResumes(job_description, top_k);
            return result;
          } catch (error) {
            return {
              error: error instanceof Error ? error.message : 'Failed to search matching resumes'
            };
          }
        },
      });
    }

    // Add analyze_job_description tool
    if (mcpToolSelection.tools.includes('analyze_job_description')) {
      mcpTools.analyzeJobDescription = tool({
        description: `Analyze a job description to extract key requirements, skills, experience level, and responsibilities. Use this to understand what a job posting is looking for.`,
        inputSchema: z.object({
          job_description: z.string().describe('The job description text to analyze'),
        }),
        execute: async ({ job_description }) => {
          try {
            const result = await analyzeJobDescription(job_description);
            return result;
          } catch (error) {
            return {
              error: error instanceof Error ? error.message : 'Failed to analyze job description'
            };
          }
        },
      });
    }

    // Add generate_resume tool
    if (mcpToolSelection.tools.includes('generate_resume')) {
      mcpTools.generateResume = tool({
        description: `Generate an optimized resume based on a job description and matched candidate profiles from the database. Use this when the user wants to create or update a resume tailored to a specific job.`,
        inputSchema: z.object({
          job_description: z.string().describe('The job description to tailor the resume for'),
          matched_resumes: z.array(z.any()).describe('List of matched resume profiles (from search_matching_resumes tool)'),
        }),
        execute: async ({ job_description, matched_resumes }) => {
          try {
            const result = await generateResume(job_description, matched_resumes);
            return { resume: result };
          } catch (error) {
            return {
              error: error instanceof Error ? error.message : 'Failed to generate resume'
            };
          }
        },
      });
    }

    const result = streamText({
      model: register.languageModel(selectedModel),
      messages: convertToModelMessages(messages),
      stopWhen: stepCountIs(10), // Increased for multi-step MCP operations
      system: systemPrompt,
      tools: {
        ...mcpTools,
        // Keep existing tools if needed
        addResource: tool({
          description: `add a resource to your knowledge base.`,
          inputSchema: z.object({
            content: z.string().describe('the content to add'),
          }),
          execute: async ({ content }) => {
            console.log('[DEBUG] addResource:', content);
            try {
              await createResource({ content });
              return { success: true };
            } catch (error) {
              console.error('[ERROR] addResource:', error);
              return { success: false, error: String(error) };
            }
          },
        }),
        ...(webSearch ? {
          webSearch: tool({
            description: `Search the web for current information.`,
            inputSchema: z.object({
              query: z.string().describe('search query'),
            }),
            execute: async ({ query }) => {
              console.log('[DEBUG] webSearch:', query);
              return { message: 'Web search not implemented', query };
            },
          }),
        } : {}),
      },
    });

    console.log('[DEBUG] ✅ Streaming response');
    return result.toUIMessageStreamResponse();
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