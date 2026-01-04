/**
 * MCP Client using Official TypeScript SDK
 * 
 * This is the RECOMMENDED approach for MCP client implementation.
 * It handles all session management, transport, and protocol details automatically.
 * 
 * Installation: npm install @modelcontextprotocol/sdk
 * 
 * To use this instead of the fetch-based implementation:
 * 1. Install the SDK: npm install @modelcontextprotocol/sdk
 * 2. Import from this file instead of mcp-client.ts
 * 3. The API is the same, but internally uses the official SDK
 */

// Note: Uncomment these imports after installing @modelcontextprotocol/sdk
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8080/mcp';

// Client instance (singleton)
let mcpClient: any = null;
let isInitialized: boolean = false;

/**
 * Initialize MCP client using official SDK
 */
async function getMCPClient(): Promise<any> {
  if (mcpClient && isInitialized) {
    return mcpClient;
  }
  // Create the StreamableHTTP transport
  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_SERVER_URL)
  );
  
  mcpClient = new Client(
    {
      name: "jcus.link",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );
  
  await mcpClient.connect(transport);
  await mcpClient.initialize();
  isInitialized = true;
  return mcpClient;
}

/**
 * Upload a job description file to MCP server
 */
export async function uploadJobDescriptionToMCP(
  fileData: Buffer | string,
  fileName: string,
  inputType: 'text' | 'file' | 'url' = 'file'
): Promise<{ job_id: string; status: string; message: string }> {
  const client = await getMCPClient();
  
  let inputData: string;
  if (inputType === 'file') {
    const buffer = Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData);
    inputData = buffer.toString('base64');
  } else {
    inputData = fileData.toString();
  }

  const result = await client.callTool('upload_job_description', {
    input_data: inputData,
    input_type: inputType,
    filename: inputType === 'file' ? fileName : undefined,
  });

  // Extract text content from SDK response
  if (result.content && result.content.length > 0) {
    const textContent = result.content.find((c: any) => c.type === 'text');
    if (textContent) {
      return JSON.parse(textContent.text);
    }
  }

  throw new Error('Invalid response from MCP server');
}

/**
 * Search for matching resumes based on job description
 */
export async function searchMatchingResumes(
  jobDescription: string,
  topK: number = 5,
  jobId?: string
): Promise<{ matches: any[]; total_found: number; job_id: string }> {
  const client = await getMCPClient();

  const payload: Record<string, any> = {
    top_k: topK,
  };
  if (jobDescription) {
    payload.job_description = jobDescription;
  } else if (jobId) {
    payload.job_id = jobId;
  }

  const result = await client.callTool('search_matching_resumes', payload);

  if (result.content && result.content.length > 0) {
    const textContent = result.content.find((c: any) => c.type === 'text');
    if (textContent) {
      return JSON.parse(textContent.text);
    }
  }

  throw new Error('Invalid response from MCP server');
}

/**
 * Analyze a job description
 */
export async function analyzeJobDescription(jobDescription: string): Promise<any> {
  const client = await getMCPClient();
  
  const result = await client.callTool('analyze_job_description', {
    job_description: jobDescription,
  });

  if (result.content && result.content.length > 0) {
    const textContent = result.content.find((c: any) => c.type === 'text');
    if (textContent) {
      const parsed = JSON.parse(textContent.text);
      return parsed.analysis || parsed;
    }
  }

  throw new Error('Invalid response from MCP server');
}

/**
 * Generate a resume based on job description and matched profiles
 */
export async function generateResume(
  jobDescription: string,
  matchedResumes: any[],
  jobId?: string
): Promise<string> {
  const client = await getMCPClient();

  const payload: Record<string, any> = {
    matched_resumes: matchedResumes,
    stream: false,
  };
  if (jobDescription) {
    payload.job_description = jobDescription;
  } else if (jobId) {
    payload.job_id = jobId;
  }

  const result = await client.callTool('generate_resume', payload);

  if (result.content && result.content.length > 0) {
    const textContent = result.content.find((c: any) => c.type === 'text');
    if (textContent) {
      return textContent.text;
    }
  }

  throw new Error('Invalid response from MCP server');
}

/**
 * List all available tools
 */
export async function listMCPTools(): Promise<any[]> {
  const client = await getMCPClient();
  const tools = await client.listTools();
  return tools.tools || [];
}

/**
 * Intelligent tool selector - same as fetch-based version
 */
export async function selectMCPToolsForQuery(query: string): Promise<{
  tools: string[];
  resources: string[];
  prompts: string[];
  reasoning: string;
}> {
  const lowerQuery = query.toLowerCase();
  
  const selectedTools: string[] = [];
  const selectedResources: string[] = [];
  const selectedPrompts: string[] = [];
  let reasoning = '';

  if (
    lowerQuery.includes('job description') ||
    lowerQuery.includes('job posting') ||
    lowerQuery.includes('upload job') ||
    lowerQuery.includes('job ad')
  ) {
    selectedTools.push('upload_job_description');
    reasoning += 'Detected job description upload request. ';
  }

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

  if (
    lowerQuery.includes('analyze job') ||
    lowerQuery.includes('job requirements') ||
    lowerQuery.includes('job skills') ||
    lowerQuery.includes('what does this job')
  ) {
    selectedTools.push('analyze_job_description');
    reasoning += 'Detected job analysis request. ';
  }

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
