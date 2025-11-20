export const MODEL_CONFIG = [
  {
    provider: "ollama",
    modelName: "LLaMA 3.1 8B (Ollama Local)",
    modelVersion: "llama3.1:8b",
    embeddingModel: "mxbai-embed-large:335m",
  },
  {
    provider: "Groq",
    modelName: "LLaMA 3.1 8B (Groq)",
    modelVersion: "llama-3.1-8b-instant",
    embeddingModel: "text-embedding-3-small",
  },
  {
    provider: "openai",
    modelName: "GPT-4o (OpenAI)",
    modelVersion: "gpt-4o",
    embeddingModel: "text-embedding-3-large",
  },
  {
    provider: "Qwen",
    modelName: "Qwen 3 4B",
    modelVersion: "qwen3:4b",
    embeddingModel: "xxx",
  }
];

export let PROMPT_DEFAULT = `You are a helpful assistant. Check your knowledge base before answering any questions.
Only respond to questions using information from tool calls.
if no relevant information is found in the tool calls, respond, "Sorry, I don't know. There is no relevant infomration in my knowledge base."`

export let PROMPT_NEW = `You are a helpful assistant. Check your knowledge base before answering any questions`