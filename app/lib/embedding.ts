import { embed, embedMany } from 'ai';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/app/lib/env.mjs';

// TODO: the current embedding Model depends on the selection of current model from chat window. 
// if the user chooses ollama(only for local), then select nomic-embed-text:latest
// if the user chooses openai, then select openai's embedding model
const embeddingModel = openai.embedding('text-embedding-ada-002');

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

function getEmbeddingModel(selectedModelName: string) {

}

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .map(chunk => chunk.trim()) // Trim each chunk to remove leading/trailing whitespace and newlines
    .filter(chunk => chunk !== ''); // Filter out empty chunks after trimming
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  const rpcArgs: Record<string, any> = {
    query_embedding: userQueryEmbedded,
    match_threshold: 0.5,
    match_count: 4,
  };

  if (env.SUPABASE_SEARCH_USER_ID) {
    rpcArgs.user_id_filter = env.SUPABASE_SEARCH_USER_ID;
  }

  const { data, error } = await supabase.rpc('search_similar_content', rpcArgs);

  if (error) {
    console.error('[DEBUG][findRelevantContent] Supabase RPC error:', error);
    throw error;
  }

  const similarChunks = (data || [])
    .map((row: { chunk_text?: string }) => row.chunk_text)
    .filter((chunk: string | undefined): chunk is string => Boolean(chunk));

  console.log('[DEBUG] ai.embedding.ts findRelevantContent (similarChunks):', similarChunks);
  return similarChunks.join('\n');
};
