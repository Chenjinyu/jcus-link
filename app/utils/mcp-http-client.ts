/**
 * MCP Client using Stateless HTTP/JSON-RPC
 * 
 * This implementation uses direct HTTP POST requests to the MCP server.
 * No persistent connection or initialization needed - each call is independent.
 */

import { envConfig } from '@/app/configs/environment';

const MCP_SERVER_URL = envConfig.mcpServerUrl;
type SupportedInputType = 'url' | 'file';

/**
 * Call MCP tool via HTTP/JSON-RPC
 */
async function callMCPTool(toolName: string, arguments_: Record<string, any>) {
  try {
    console.log(`[DEBUG] Calling MCP tool: ${toolName}`, { arguments: arguments_ });
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(), // or crypto.randomUUID()
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: arguments_,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
    }

    console.log(`[DEBUG] MCP tool response:`, response);
    const data = await response.json();
    console.log(`searchSimilarContent`, data);

    if (data.error) {
      throw new Error(`MCP error: ${data.error.message}`);
    }

    return data.result;
    
  } catch (error) {
    console.error(`[ERROR] MCP tool call failed:`, error);
    throw error;
  }
}

/**
 * Generate a matched resume from a job description file or URL.
 */
export async function generateMatchedResume(
  inputType: SupportedInputType,
  inputData: string,
  filename: string,
  topK: number = 10,
  threshold: number = 0.5
): Promise<string> {
  return callMCPTool('generate_matched_resume', {
    input_type: inputType,
    input_data: inputData,
    filename: filename,
    top_k: topK,
    threshold: threshold,
  });
}

/**
 * Get all work experience for the user.
 */
export async function getAllWorkExperience(content: string): Promise<string> {
  return callMCPTool('all_work_experience', {
    content: content,
  });
}

/**
 * Search for matching content by similarity.
 */
export async function searchSimilarContent(
  inputData: string,
  topK: number = 10,
  threshold: number = 0.5
): Promise<string> {
  return callMCPTool('search_similar_content', {
    input_text: inputData,
    top_k: topK,
    threshold: threshold,
  });
}

/**
 * Get matched resumes for a job description.
 */
export async function getMatchedResumes(
  inputData: string,
  inputType: string,
  fileName: string,
  topK: number = 10,
  threshold: number = 0.5
): Promise<string> {
  return callMCPTool('generate_matched_resume', {
    input_type: inputType,
    input_data: inputData,
    filename: fileName,
    top_k: topK,
    threshold: threshold,
  });
}
