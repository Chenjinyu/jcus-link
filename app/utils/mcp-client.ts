/**
 * MCP Client Utility for Next.js
 * 
 * This utility provides functions to interact with the MCP server running on localhost:8080/mcp
 * It handles tools, resources, and prompts using HTTP/SSE transport with proper session management.
 * 
 * NOTE: For production use, consider using @modelcontextprotocol/sdk which handles all session
 * management automatically. Install with: npm install @modelcontextprotocol/sdk
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8080/mcp';

// Session management state
let sessionId: string | null = null;
let protocolVersion: string = '2024-11-05';
let isInitialized: boolean = false;

export interface MCPToolCallRequest {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolCallResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

/**
 * Extract session ID and protocol version from response headers
 */
function extractSessionFromHeaders(headers: Headers): void {
  const sessionHeader = headers.get('mcp-session-id');
  const versionHeader = headers.get('mcp-protocol-version');
  
  if (sessionHeader) {
    sessionId = sessionHeader.trim();
  }
  if (versionHeader) {
    protocolVersion = versionHeader.trim();
  }
}

/**
 * Get headers for MCP requests (includes session ID if available)
 */
function getMCPHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
  };
  
  if (sessionId) {
    headers['mcp-session-id'] = sessionId;
    headers['mcp-protocol-version'] = protocolVersion;
  }
  
  return headers;
}

/**
 * Send an MCP request using the SSE transport protocol with session management
 */
async function sendMCPRequest(
  method: string, 
  params: any, 
  requestId?: string,
  isNotification: boolean = false
): Promise<any> {
  try {
    // Build request body
    const requestBody: any = {
      jsonrpc: '2.0',
      method,
      params,
    };
    
    // Notifications don't have an id field
    if (!isNotification) {
      requestBody.id = requestId || Date.now().toString();
    }

    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: getMCPHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.statusText}`);
    }

    // Extract session information from headers (for initialize response)
    if (method === 'initialize') {
      extractSessionFromHeaders(response.headers);
    }

    // Notifications don't return a response body
    if (isNotification) {
      return {};
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'MCP server error');
    }

    return data.result;
  } catch (error) {
    console.error('[MCP Client] Error:', error);
    throw error;
  }
}

/**
 * Initialize MCP connection and get server capabilities
 * This MUST be called before any other MCP operations
 */
export async function initializeMCP(): Promise<{ capabilities: any; serverInfo: any }> {
  try {
    // Reset session state
    sessionId = null;
    protocolVersion = '2024-11-05';
    isInitialized = false;

    // Step 1: Send initialize request
    const result = await sendMCPRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'jcus.link-nextjs',
        version: '1.0.0',
      },
    });

    // Step 2: Send initialized notification (must include session ID in headers)
    if (!sessionId) {
      throw new Error('Session ID not received from initialize response');
    }

    await sendMCPRequest('notifications/initialized', {}, undefined, true);
    
    isInitialized = true;
    console.log('[MCP Client] Initialized with session ID:', sessionId);

    return result;
  } catch (error) {
    console.error('[MCP Client] Initialization failed:', error);
    isInitialized = false;
    sessionId = null;
    throw error;
  }
}

/**
 * Ensure MCP is initialized before making requests
 */
async function ensureInitialized(): Promise<void> {
  if (!isInitialized || !sessionId) {
    await initializeMCP();
  }
}

/**
 * List all available tools from the MCP server
 */
export async function listMCPTools(): Promise<MCPTool[]> {
  try {
    await ensureInitialized();
    const result = await sendMCPRequest('tools/list', {});
    return result.tools || [];
  } catch (error) {
    console.error('[MCP Client] Failed to list tools:', error);
    return [];
  }
}

/**
 * Call an MCP tool
 */
export async function callMCPTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    await ensureInitialized();
    const result = await sendMCPRequest('tools/call', {
      name,
      arguments: args,
    });

    // Extract text content from response
    if (result.content && Array.isArray(result.content)) {
      const textContent = result.content.find((c: any) => c.type === 'text');
      if (textContent) {
        return textContent.text;
      }
    }

    return JSON.stringify(result);
  } catch (error) {
    console.error(`[MCP Client] Failed to call tool ${name}:`, error);
    throw error;
  }
}

/**
 * List all available resources from the MCP server
 */
export async function listMCPResources(): Promise<MCPResource[]> {
  try {
    await ensureInitialized();
    const result = await sendMCPRequest('resources/list', {});
    return result.resources || [];
  } catch (error) {
    console.error('[MCP Client] Failed to list resources:', error);
    return [];
  }
}

/**
 * Read an MCP resource by URI
 */
export async function readMCPResource(uri: string): Promise<string> {
  try {
    await ensureInitialized();
    const result = await sendMCPRequest('resources/read', { uri });
    
    if (result.contents && Array.isArray(result.contents)) {
      const textContent = result.contents.find((c: any) => c.type === 'text');
      if (textContent) {
        return textContent.text;
      }
    }

    return JSON.stringify(result);
  } catch (error) {
    console.error(`[MCP Client] Failed to read resource ${uri}:`, error);
    throw error;
  }
}

/**
 * List all available prompts from the MCP server
 */
export async function listMCPPrompts(): Promise<MCPPrompt[]> {
  try {
    await ensureInitialized();
    const result = await sendMCPRequest('prompts/list', {});
    return result.prompts || [];
  } catch (error) {
    console.error('[MCP Client] Failed to list prompts:', error);
    return [];
  }
}

/**
 * Get a prompt template
 */
export async function getMCPPrompt(name: string, args: Record<string, string>): Promise<string> {
  try {
    await ensureInitialized();
    const result = await sendMCPRequest('prompts/get', {
      name,
      arguments: args,
    });

    if (result.messages && Array.isArray(result.messages)) {
      // Return the first message content
      const message = result.messages[0];
      if (message.content) {
        return typeof message.content === 'string' 
          ? message.content 
          : JSON.stringify(message.content);
      }
    }

    return JSON.stringify(result);
  } catch (error) {
    console.error(`[MCP Client] Failed to get prompt ${name}:`, error);
    throw error;
  }
}

/**
 * Upload a job description file to MCP server
 */
export async function uploadJobDescriptionToMCP(
  fileData: Buffer | string,
  fileName: string,
  inputType: 'text' | 'file' | 'url' = 'file'
): Promise<{ job_id: string; status: string; message: string }> {
  try {
    let inputData: string;
    
    if (inputType === 'file') {
      // Convert file buffer to base64
      const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
      inputData = buffer.toString('base64');
    } else {
      inputData = fileData.toString();
    }

    const result = await callMCPTool('upload_job_description', {
      input_data: inputData,
      input_type: inputType,
      filename: inputType === 'file' ? fileName : undefined,
    });

    const parsed = JSON.parse(result);
    return parsed;
  } catch (error) {
    console.error('[MCP Client] Failed to upload job description:', error);
    throw error;
  }
}

/**
 * Search for matching resumes based on job description
 */
export async function searchMatchingResumes(
  jobDescription: string,
  topK: number = 5,
  jobId?: string
): Promise<{ matches: any[]; total_found: number; job_id: string }> {
  try {
    const payload: Record<string, any> = { top_k: topK };
    if (jobDescription) {
      payload.job_description = jobDescription;
    } else if (jobId) {
      payload.job_id = jobId;
    }

    const result = await callMCPTool('search_matching_resumes', payload);

    const parsed = JSON.parse(result);
    return parsed;
  } catch (error) {
    console.error('[MCP Client] Failed to search matching resumes:', error);
    throw error;
  }
}

/**
 * Analyze a job description
 */
export async function analyzeJobDescription(jobDescription: string): Promise<any> {
  try {
    const result = await callMCPTool('analyze_job_description', {
      job_description: jobDescription,
    });

    const parsed = JSON.parse(result);
    return parsed.analysis || parsed;
  } catch (error) {
    console.error('[MCP Client] Failed to analyze job description:', error);
    throw error;
  }
}

/**
 * Generate a resume based on job description and matched profiles
 */
export async function generateResume(
  jobDescription: string,
  matchedResumes: any[],
  jobId?: string
): Promise<string> {
  try {
    const payload: Record<string, any> = {
      matched_resumes: matchedResumes,
      stream: false,
    };
    if (jobDescription) {
      payload.job_description = jobDescription;
    } else if (jobId) {
      payload.job_id = jobId;
    }

    const result = await callMCPTool('generate_resume', payload);

    return result; // This returns markdown resume text
  } catch (error) {
    console.error('[MCP Client] Failed to generate resume:', error);
    throw error;
  }
}

/**
 * Intelligent tool selector - determines which MCP tools/resources/prompts to use
 * based on user query
 */
export async function selectMCPToolsForQuery(query: string): Promise<{
  tools: string[];
  resources: string[];
  prompts: string[];
  reasoning: string;
}> {
  // This is a simple keyword-based selector
  // In production, you might want to use an LLM to intelligently select tools
  const lowerQuery = query.toLowerCase();
  
  const selectedTools: string[] = [];
  const selectedResources: string[] = [];
  const selectedPrompts: string[] = [];
  let reasoning = '';

  // Job description related
  if (
    lowerQuery.includes('job description') ||
    lowerQuery.includes('job posting') ||
    lowerQuery.includes('upload job') ||
    lowerQuery.includes('job ad')
  ) {
    selectedTools.push('upload_job_description');
    reasoning += 'Detected job description upload request. ';
  }

  // Resume search related
  if (
    lowerQuery.includes('find resume') ||
    lowerQuery.includes('match resume') ||
    lowerQuery.includes('search resume') ||
    lowerQuery.includes('matching candidates') ||
    lowerQuery.includes('similar resume')
  ) {
    selectedTools.push('search_matching_resumes');
    reasoning += 'Detected resume search request. ';
  }

  // Job analysis related
  if (
    lowerQuery.includes('analyze job') ||
    lowerQuery.includes('job requirements') ||
    lowerQuery.includes('job skills') ||
    lowerQuery.includes('what does this job')
  ) {
    selectedTools.push('analyze_job_description');
    reasoning += 'Detected job analysis request. ';
  }

  // Resume generation related
  if (
    lowerQuery.includes('generate resume') ||
    lowerQuery.includes('create resume') ||
    lowerQuery.includes('build resume') ||
    lowerQuery.includes('tailor resume') ||
    lowerQuery.includes('update resume') ||
    lowerQuery.includes('optimize resume')
  ) {
    selectedTools.push('generate_resume');
    selectedPrompts.push('resume_generation_prompt');
    reasoning += 'Detected resume generation request. ';
  }

  // List jobs
  if (
    lowerQuery.includes('list job') ||
    lowerQuery.includes('show jobs') ||
    lowerQuery.includes('all jobs')
  ) {
    selectedTools.push('list_matched_job_descriptions');
    reasoning += 'Detected job listing request. ';
  }

  if (selectedTools.length === 0) {
    reasoning = 'No specific MCP tools identified for this query.';
  }

  return {
    tools: selectedTools,
    resources: selectedResources,
    prompts: selectedPrompts,
    reasoning,
  };
}
