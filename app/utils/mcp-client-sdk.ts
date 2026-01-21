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

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8000/mcp';

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
      name: "jcus-link-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );
  
  try {
    console.log('[DEBUG] getMCPClient: Connecting to MCP server...');
    await mcpClient.connect(transport);
    console.log('[DEBUG] getMCPClient: Connected, initializing...');
    await mcpClient.initialize();
    console.log('[DEBUG] getMCPClient: Initialized successfully');
    isInitialized = true;
    return mcpClient;
  } catch (error) {
    console.error('[ERROR] getMCPClient failed:', error instanceof Error ? error.message : String(error));
    console.error('[ERROR] Full error:', error);
    throw error;
  }
}

type SupportedInputType = 'pdf' | 'doc' | 'docs' | 'txt' | 'html' | 'url';

/**
 * Generate a matched resume from a job description file or URL.
 * It includes matched and not-matched work experience.
 */
export async function generateMatchedResume(
  inputType: SupportedInputType,
  inputData: string,
  filename: string,
  topK: number = 10,
  threshold: number = 0.5
): Promise<string> {
  const client = await getMCPClient();

  const payload = {
    input_type: inputType,
    filename: filename,
    input_data: inputData,
    top_k: topK,
    threshold: threshold,
  };

  const result = await client.callTool('generate_matched_resume', payload);

  if (result.content && result.content.length > 0) {
    const textContent = result.content.find((c: any) => c.type === 'text');
    if (textContent) {
      return textContent.text;
    }
  }

  throw new Error('Invalid response from MCP server');
}


export async function getAllWorkExperience(
  content: string
):Promise<string>  {
  const client = await getMCPClient();
  const result = await client.callTool('all_work_experience');
  if (result.content && result.content.length > 0) {
    const textContent = result.content.find((c: any) => c.type === 'text');
    if (textContent) {
      return textContent.text;
    }
  }

  throw new Error('Invalid response from MCP server');
}

export async function searchSimilarityContent(
  inputText: string,
  topK: number = 10,
  threshold: number = 0.7
){
  const client = await getMCPClient();
  console.log("[searchSimilarityContent] perparing the payload sends to mcp server.");
  const payload = {
    input_text: inputText,
    top_k: topK,
    threshold: threshold,
  };

  const result = await client.callTool('search_similar_content', payload);
  
  if (result.content && result.content.length > 0) {
    const textContent = result.content.find((c: any) => c.type === 'text');
    if (textContent) {
      return textContent.text;
    }
  }

  throw new Error('Invalid response from MCP server');
}

export async function getMatchedResumes(
  inputData: string,
  inputType: string,
  fileName: string,
  topK: number = 10,
  threshold: number = 0.7
){
  const client = await getMCPClient();
  console.log("[getMatchedResumes] perparing the payload sends to mcp server.");
  const payload = {
    input_data: inputData,
    input_type: inputType,
    filename: fileName,
    top_k: topK,
    threshold: threshold,
  };

  const result = await client.callTool('generate_matched_resume', payload);
  
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
