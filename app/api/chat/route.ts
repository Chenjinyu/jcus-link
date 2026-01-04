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
import { findRelevantContent } from '@/app/lib/embedding';
import { JOB_MATCH_COMMAND, JOB_MATCH_PROMPT_TOKEN } from '@/app/constants';
import {
  uploadJobDescriptionToMCP,
  searchMatchingResumes,
  analyzeJobDescription,
  generateResume,
  selectMCPToolsForQuery,
} from '@/app/utils/mcp-client-sdk';

console.log(`[INIT] Chat route loaded in ${envConfig.env} environment`);
export const maxDuration = 60; // Increased for MCP operations

const jobMatchSessions = new Map<
  string,
  {
    jobDescription: string;
    matches: any[];
    uploadedJobIds: string[];
  }
>();

const normalizeDecision = (input: string): 'yes' | 'no' | null => {
  const normalized = input.trim().toLowerCase();
  if (normalized === 'yes' || normalized === 'y') {
    return 'yes';
  }
  if (normalized === 'no' || normalized === 'n') {
    return 'no';
  }
  return null;
};

const extractTextFromDataUrl = (dataUrl: string): string | null => {
  if (!dataUrl.startsWith('data:')) {
    return null;
  }
  const [meta, data] = dataUrl.split(',');
  if (!meta || data == null) {
    return null;
  }
  const isBase64 = meta.includes(';base64');
  try {
    return isBase64 ? Buffer.from(data, 'base64').toString('utf8') : decodeURIComponent(data);
  } catch (error) {
    console.warn('[CHAT] Failed to decode data URL text:', error);
    return null;
  }
};

const extractMatchScore = (match: any): number | null => {
  const rawScore =
    match?.similarity ??
    match?.score ??
    match?.match_score ??
    match?.match_rate ??
    match?.similarity_score ??
    null;
  if (typeof rawScore !== 'number' || Number.isNaN(rawScore)) {
    return null;
  }
  const normalized = rawScore <= 1 ? rawScore * 100 : rawScore;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

const formatMatchSummary = (matches: any[]): { summary: string; topRate: number | null } => {
  if (!Array.isArray(matches) || matches.length === 0) {
    return {
      summary: 'No matching resumes were found for the uploaded job description.',
      topRate: null,
    };
  }

  const topMatches = matches.slice(0, 5).map((match, index) => {
    const name =
      match?.name ??
      match?.candidate_name ??
      match?.title ??
      match?.id ??
      `Candidate ${index + 1}`;
    const score = extractMatchScore(match);
    return score === null ? `- ${name}` : `- ${name}: ${score}% match`;
  });

  const topRate = extractMatchScore(matches[0]);
  return {
    summary: `Top matches:\n${topMatches.join('\n')}`,
    topRate,
  };
};

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
    const conversationId = body.conversationId || 'default';

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

    /**
     * Extract text from message parts with proper type narrowing, this is a type guard(type predicate)
     * parts is likely defined as a union type of { type: 'text' } | { type: 'file' } | { type: 'url' }
     * It might not issue during dev or debug env.
     * Extract<> is a typescript utility type that extracts the type from the union type
     * Extract<typeof part, { type: 'text' }>, result: {type: 'text', text: string}
     * without Extract<>, will raise type error: part.text does not exist during npm run build.
     * because typescript does not know .filter() returns a text type from parts.
     */
    const userQuery = lastUserMessage?.parts
      .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
      .map(part => part.text)
      .join(' ') || '';

    const trimmedQuery = userQuery.trim();
    const isJobMatchCommand = trimmedQuery.toLowerCase().startsWith(JOB_MATCH_COMMAND);
    const jobMatchPayload = isJobMatchCommand
      ? trimmedQuery.slice(JOB_MATCH_COMMAND.length).trim()
      : trimmedQuery;
    const decision = normalizeDecision(jobMatchPayload);

    if (decision && jobMatchSessions.has(conversationId)) {
      const session = jobMatchSessions.get(conversationId);
      if (!session) {
        throw new Error('Job match session data not found');
      }

      if (decision === 'no') {
        jobMatchSessions.delete(conversationId);
        const declineResponse = streamText({
          model: register.languageModel(selectedModel),
          messages: convertToModelMessages(messages),
          system: `${PROMPT_DEFAULT}\n\nThe user declined resume generation. Respond politely and ask if they need anything else.`,
        });
        return declineResponse.toUIMessageStreamResponse();
      }

      try {
        const resume = await generateResume(
          session.jobDescription,
          session.matches,
          session.uploadedJobIds[0]
        );
        jobMatchSessions.delete(conversationId);
        const resumeResponse = streamText({
          model: register.languageModel(selectedModel),
          messages: convertToModelMessages(messages),
          system: `${PROMPT_DEFAULT}\n\nProvide the updated resume below without altering its content. Keep the introduction to one short sentence.\n\nResume:\n${resume}`,
        });
        return resumeResponse.toUIMessageStreamResponse();
      } catch (resumeError) {
        console.error('[MCP] Failed to generate resume:', resumeError);
        const failureResponse = streamText({
          model: register.languageModel(selectedModel),
          messages: convertToModelMessages(messages),
          system: `${PROMPT_DEFAULT}\n\nExplain that resume generation failed and ask the user to try again.`,
        });
        return failureResponse.toUIMessageStreamResponse();
      }
    }

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

    if (isJobMatchCommand) {
      const files = (lastUserMessage as any)?.files || [];
      let jobDescriptionText = jobMatchPayload;

      if (!jobDescriptionText && files.length > 0) {
        for (const file of files) {
          const isTextFile = file.mediaType?.startsWith('text/') || file.filename?.match(/\.(txt|md|html|xml)$/i);
          if (!isTextFile) {
            continue;
          }

          if (typeof file.url === 'string') {
            const extractedText = extractTextFromDataUrl(file.url) || file.url;
            if (extractedText.trim()) {
              jobDescriptionText = extractedText.trim();
              break;
            }
          }
        }
      }

      if (!jobDescriptionText && uploadedJobIds.length === 0) {
        const missingInputResponse = streamText({
          model: register.languageModel(selectedModel),
          messages: convertToModelMessages(messages),
          system: `${PROMPT_DEFAULT}\n\nThe user requested /job_match but did not provide a job description. Ask them to paste the job description text or upload a file.`,
        });
        return missingInputResponse.toUIMessageStreamResponse();
      }

      let matchResults: { matches: any[]; total_found: number; job_id: string } | null = null;
      const jobIdForSearch = !jobDescriptionText && uploadedJobIds.length > 0 ? uploadedJobIds[0] : undefined;
      if (jobDescriptionText || jobIdForSearch) {
        try {
          matchResults = await searchMatchingResumes(jobDescriptionText, 5, jobIdForSearch);
        } catch (matchError) {
          console.error('[MCP] Failed to search matching resumes:', matchError);
        }
      }

      if (matchResults) {
        jobMatchSessions.set(conversationId, {
          jobDescription: jobDescriptionText,
          matches: matchResults.matches || [],
          uploadedJobIds,
        });
      }

      const { summary, topRate } = formatMatchSummary(matchResults?.matches || []);
      const matchSummaryText = [
        topRate !== null
          ? `Best overall match: ${topRate}%`
          : 'No match score was available yet.',
        summary,
        `Would you like me to generate an updated resume tailored to this job?`,
      ].join('\n');

      const jobMatchResponse = streamText({
        model: register.languageModel(selectedModel),
        messages: convertToModelMessages(messages),
        system: `${PROMPT_DEFAULT}\n\nYou are responding to a /job_match request. Use the following match data:\n${matchSummaryText}\n\nRespond with that information, keep it concise, and include the token ${JOB_MATCH_PROMPT_TOKEN} on its own line at the end.`,
      });
      return jobMatchResponse.toUIMessageStreamResponse();
    }

    let knowledgeBaseContext = '';
    if (userQuery.trim()) {
      try {
        knowledgeBaseContext = await findRelevantContent(userQuery);
      } catch (error) {
        console.warn('[CHAT] Similarity search failed:', error);
      }
    }

    // Build system prompt with MCP context
    let systemPrompt = PROMPT_DEFAULT;
    if (knowledgeBaseContext) {
      systemPrompt += `\n\nRelevant knowledge base context:\n${knowledgeBaseContext}\n\nUse this context to answer the user when relevant.`;
    }
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
        getInformation: tool({
          description: `Search the Supabase knowledge base for relevant context when the user asks for information.`,
          inputSchema: z.object({
            question: z.string().describe('The user question to search for'),
          }),
          execute: async ({ question }) => {
            const result = await findRelevantContent(question);
            return result;
          },
        }),
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
