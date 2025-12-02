# RAG Chat Interface with AI Elements

This guide explains how to build a conversational interface where users can ask questions about you, and an AI model retrieves relevant information from your indexed data using RAG (Retrieval-Augmented Generation).

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client UI     │────▶│   API Endpoint   │────▶│  RAG Pipeline   │
│  (AI Elements)  │◀────│   (Next.js API)  │◀────│                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                        ┌─────────────────────────────────┼─────────────────────────────────┐
                        │                                 │                                 │
                        ▼                                 ▼                                 ▼
               ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
               │ Embedding Model │             │  Vector Store   │             │    LLM Model    │
               │ (OpenAI, etc.)  │             │ (Pinecone, etc) │             │ (GPT-4, Claude) │
               └─────────────────┘             └─────────────────┘             └─────────────────┘
```

## Flow Explanation

1. **User sends a question** via the Message component
2. **Question is sent to your API** endpoint
3. **API processes the query** through your RAG pipeline:
   - Converts question to embedding vector
   - Queries vector database for similar content
   - Retrieves relevant document chunks
   - Sends context + question to LLM
   - LLM generates response based on retrieved context
4. **Response + sources returned** to the client
5. **UI renders the response** in the Message component with sources

---

## Installation

### 1. Install AI Elements

```bash
# Using the AI Elements CLI
npx ai-elements@latest add message
npx ai-elements@latest add conversation
npx ai-elements@latest add prompt-input
npx ai-elements@latest add sources
npx ai-elements@latest add loader

# Or install all at once
npx ai-elements@latest add all
```

### 2. Install Dependencies for RAG

```bash
npm install @ai-sdk/react ai openai @pinecone-database/pinecone
# or
pnpm add @ai-sdk/react ai openai @pinecone-database/pinecone
```

---

## Backend Implementation

### API Route (app/api/chat/route.ts)

```typescript
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

interface RAGSource {
  id: string;
  title: string;
  url?: string;
  content: string;
  relevanceScore: number;
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Step 1: Generate embedding for the user's question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Step 2: Query vector database for relevant documents
    const index = pinecone.index('your-index-name');
    const queryResult = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    // Step 3: Format retrieved documents as context
    const sources: RAGSource[] = queryResult.matches.map((match) => ({
      id: match.id,
      title: match.metadata?.title as string || 'Document',
      url: match.metadata?.url as string,
      content: match.metadata?.content as string || '',
      relevanceScore: match.score || 0,
    }));

    const context = sources
      .map((s) => `[${s.title}]: ${s.content}`)
      .join('\n\n');

    // Step 4: Generate response using LLM with retrieved context
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions about a person based on the provided context. 
Only use information from the context to answer questions. 
If the context doesn't contain relevant information, say so politely.

Context:
${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content;

    return NextResponse.json({
      answer,
      sources: sources.filter((s) => s.relevanceScore > 0.7), // Only return high-relevance sources
    });
  } catch (error) {
    console.error('RAG Error:', error);
    return NextResponse.json(
      { error: 'Failed to process your question' },
      { status: 500 }
    );
  }
}
```

---

## Streaming Implementation

For a better user experience, implement streaming responses:

### Streaming API Route (app/api/chat/stream/route.ts)

```typescript
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  // Create a TransformStream for streaming
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Process in background
  (async () => {
    try {
      // Get embedding and query vector DB
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
      });

      const index = pinecone.index('your-index-name');
      const queryResult = await index.query({
        vector: embeddingResponse.data[0].embedding,
        topK: 5,
        includeMetadata: true,
      });

      // Send sources first
      const sources = queryResult.matches.map((match) => ({
        id: match.id,
        title: match.metadata?.title || 'Document',
        url: match.metadata?.url,
        content: match.metadata?.content || '',
        relevanceScore: match.score || 0,
      }));

      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources })}\n\n`)
      );

      // Build context
      const context = sources.map((s) => `[${s.title}]: ${s.content}`).join('\n\n');

      // Stream the LLM response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Answer questions based on this context:\n${context}`,
          },
          { role: 'user', content: message },
        ],
        stream: true,
      });

      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`)
          );
        }
      }

      await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
    } catch (error) {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'An error occurred' })}\n\n`)
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### Client-Side Streaming Handler

```typescript
async function sendMessageWithStreaming(message: string) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  let sources: RAGSource[] = [];
  let fullContent = '';

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

    for (const line of lines) {
      const data = JSON.parse(line.slice(6));

      if (data.type === 'sources') {
        sources = data.sources;
        // Update UI with sources
      } else if (data.type === 'chunk') {
        fullContent += data.content;
        // Update UI with streaming content
      } else if (data.type === 'done') {
        // Mark streaming as complete
      }
    }
  }
}
```

---

## Using with Vercel AI SDK

The cleanest integration uses the Vercel AI SDK's `useChat` hook:

```typescript
'use client';

import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-screen">
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                <MessageResponse>{message.content}</MessageResponse>
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question..."
          className="w-full p-2 border rounded"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
```

---

## Component Breakdown

### Message Component Anatomy

```tsx
<Message from="user" | "assistant">
  {/* Optional: Custom avatar */}
  <Avatar />
  
  <MessageContent>
    {/* Main content with markdown support */}
    <MessageResponse>
      {message.content}
    </MessageResponse>
    
    {/* Optional: Display sources */}
    <Sources>
      <Source title="Document Title" href="/path" />
    </Sources>
    
    {/* Optional: Action buttons */}
    <MessageActions>
      <MessageAction icon={<Copy />} label="Copy" onClick={handleCopy} />
      <MessageAction icon={<RefreshCcw />} label="Regenerate" onClick={handleRegenerate} />
    </MessageActions>
  </MessageContent>
</Message>
```

### Key Props

| Component | Prop | Description |
|-----------|------|-------------|
| `Message` | `from` | `"user"` or `"assistant"` - determines styling |
| `MessageResponse` | `children` | Content with automatic markdown rendering |
| `MessageAction` | `icon`, `label`, `onClick` | Action button configuration |
| `Source` | `title`, `href` | Link to source document |

---

## Indexing Your Data

Before the RAG system works, you need to index your personal data:

```typescript
// scripts/index-data.ts
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

interface Document {
  id: string;
  title: string;
  content: string;
  url?: string;
}

async function indexDocuments(documents: Document[]) {
  const index = pinecone.index('your-index-name');

  for (const doc of documents) {
    // Generate embedding
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: doc.content,
    });

    // Upsert to Pinecone
    await index.upsert([
      {
        id: doc.id,
        values: embedding.data[0].embedding,
        metadata: {
          title: doc.title,
          content: doc.content,
          url: doc.url,
        },
      },
    ]);

    console.log(`Indexed: ${doc.title}`);
  }
}

// Example usage
const myData: Document[] = [
  {
    id: 'profile-1',
    title: 'About Me',
    content: 'Your personal introduction and background...',
    url: '/about',
  },
  {
    id: 'experience-1',
    title: 'Work Experience',
    content: 'Your professional experience details...',
    url: '/experience',
  },
  // Add more documents...
];

indexDocuments(myData);
```

---

## Environment Variables

```env
# .env.local
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
```

---

## Summary

1. **Install AI Elements** components for the UI
2. **Set up your vector database** (Pinecone, Weaviate, Chroma, etc.)
3. **Index your personal data** with embeddings
4. **Create an API route** that handles RAG queries
5. **Build the UI** using Message, Conversation, and PromptInput components
6. **Connect everything** - user questions flow through the RAG pipeline and return with sources

The AI Elements components handle all the UI complexity (streaming, markdown, actions, sources) so you can focus on your RAG implementation.