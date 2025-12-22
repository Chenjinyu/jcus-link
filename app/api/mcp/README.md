# MCP Integration for jcus.link

This directory contains API routes and utilities for integrating with the MCP (Model Context Protocol) server running on `localhost:8080/mcp`.

## Overview

The MCP integration allows the chat interface to:
- Upload job description files (PDF, DOCX, TXT, MD, HTML, XML, URLs)
- Search for matching resumes from the Supabase vector database
- Analyze job descriptions to extract key requirements
- Generate optimized resumes based on job descriptions and developer backgrounds

## Architecture

```
Chat Interface (Frontend)
    ↓
/api/chat (Next.js API Route)
    ↓
MCP Client Utility (/app/utils/mcp-client.ts)
    ↓
MCP Server (localhost:8080/mcp)
    ↓
Supabase Vector Database
```

## Available MCP Tools

The chat AI can automatically use these tools based on user queries:

### 1. `uploadJobDescription`
- **Purpose**: Upload job descriptions to MCP server
- **Triggers**: When user mentions "job description", "job posting", "upload job", etc.
- **Supports**: Text, file uploads (PDF, DOCX, TXT, MD, HTML, XML), and URLs

### 2. `searchMatchingResumes`
- **Purpose**: Search for resumes matching a job description using vector similarity
- **Triggers**: When user asks to "find resume", "match resume", "search candidates", etc.
- **Returns**: Top matching resumes with similarity scores

### 3. `analyzeJobDescription`
- **Purpose**: Extract key requirements, skills, and experience level from job descriptions
- **Triggers**: When user asks to "analyze job", "what does this job require", etc.
- **Returns**: Structured analysis of job requirements

### 4. `generateResume`
- **Purpose**: Generate an optimized resume tailored to a job description
- **Triggers**: When user asks to "generate resume", "create resume", "update resume", etc.
- **Returns**: Markdown-formatted resume

## File Upload API

### POST `/api/mcp/upload`

Upload job description files directly to the MCP server.

**Request** (FormData):
- `file`: File object (PDF, DOCX, TXT, MD, HTML, XML)
- `url`: URL string (alternative to file)
- `text`: Text content (alternative to file)

**Response**:
```json
{
  "success": true,
  "job_id": "job_2024-01-01T12:00:00",
  "status": "success",
  "message": "Job description uploaded successfully",
  "uploaded_file": "job_posting.pdf",
  "input_type": "file"
}
```

**Example**:
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/mcp/upload', {
  method: 'POST',
  body: formData,
});
```

## Usage in Chat

The chat interface automatically detects when to use MCP tools based on user queries. Examples:

### Upload Job Description
**User**: "I've attached a job description PDF. Can you analyze it?"
- System automatically uploads the file to MCP
- Uses `analyzeJobDescription` tool to extract requirements

### Search Matching Resumes
**User**: "Find resumes that match this job description"
- System uses `searchMatchingResumes` tool
- Returns top candidates from Supabase vector database

### Generate Resume
**User**: "Generate a resume for me based on this job posting"
- System first searches for matching resumes
- Then uses `generateResume` tool to create optimized resume
- Combines job requirements with developer background data

## Configuration

Set the MCP server URL in your environment variables:

```env
MCP_SERVER_URL=http://localhost:8080/mcp
```

Or in `app/lib/env.mjs`, it defaults to `http://localhost:8080/mcp`.

## Intelligent Tool Selection

The system uses keyword-based detection to automatically select appropriate MCP tools. The `selectMCPToolsForQuery()` function analyzes user queries and suggests which tools to use.

For production, you might want to enhance this with LLM-based tool selection for better accuracy.

## Error Handling

All MCP operations include error handling. If the MCP server is unavailable or returns an error, the chat interface will gracefully handle it and inform the user.

## Development

To test the MCP integration:

1. Ensure MCP server is running on `localhost:8080`
2. Start the Next.js development server
3. Upload a job description file in the chat interface
4. Ask questions like:
   - "Analyze this job description"
   - "Find matching resumes"
   - "Generate a resume for this job"

## Troubleshooting

**MCP server connection failed**:
- Check if MCP server is running: `curl http://localhost:8080/mcp`
- Verify `MCP_SERVER_URL` environment variable
- Check network connectivity

**File upload fails**:
- Verify file type is supported (PDF, DOCX, TXT, MD, HTML, XML)
- Check file size (10MB limit)
- Ensure MCP server is running

**Tools not being called**:
- Check user query contains relevant keywords
- Verify MCP server has registered the tools
- Check browser console for errors

