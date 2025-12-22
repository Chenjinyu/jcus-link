import { NextRequest, NextResponse } from 'next/server';
import { uploadJobDescriptionToMCP } from '@/app/utils/mcp-client';

export const maxDuration = 60; // Allow longer timeout for file processing

/**
 * API Route: /api/mcp/upload
 * 
 * Handles file uploads and forwards them to the MCP server
 * Supports: PDF, DOCX, TXT, MD, HTML, XML, URLs
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileUrl = formData.get('url') as string | null;
    const textContent = formData.get('text') as string | null;

    // Determine input type
    let inputType: 'text' | 'file' | 'url' = 'text';
    let inputData: Buffer | string = '';
    let fileName = '';

    if (fileUrl) {
      // URL input
      inputType = 'url';
      inputData = fileUrl;
      fileName = fileUrl;
    } else if (file) {
      // File input
      inputType = 'file';
      const arrayBuffer = await file.arrayBuffer();
      inputData = Buffer.from(arrayBuffer);
      fileName = file.name;
    } else if (textContent) {
      // Text input
      inputType = 'text';
      inputData = textContent;
      fileName = 'job_description.txt';
    } else {
      return NextResponse.json(
        { error: 'No file, URL, or text content provided' },
        { status: 400 }
      );
    }

    // Validate file type if it's a file
    if (inputType === 'file' && file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'text/plain',
        'text/markdown',
        'text/html',
        'application/xml',
        'text/xml',
      ];

      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.html', '.xml', '.htm'];

      const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
      const isValidType = 
        allowedTypes.includes(file.type) || 
        allowedExtensions.some(ext => fileName.toLowerCase().endsWith(ext));

      if (!isValidType) {
        return NextResponse.json(
          { 
            error: 'Invalid file type. Supported types: PDF, DOC, DOCX, TXT, MD, HTML, XML' 
          },
          { status: 400 }
        );
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size exceeds 10MB limit' },
          { status: 400 }
        );
      }
    }

    // Upload to MCP server
    console.log(`[MCP Upload] Uploading ${inputType}: ${fileName}`);
    const result = await uploadJobDescriptionToMCP(inputData, fileName, inputType);

    return NextResponse.json({
      success: true,
      ...result,
      uploaded_file: fileName,
      input_type: inputType,
    });

  } catch (error) {
    console.error('[MCP Upload] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to upload to MCP server',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

