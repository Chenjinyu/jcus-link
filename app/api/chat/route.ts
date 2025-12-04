import { streamText, UIMessage, convertToModelMessages } from 'ai';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
export async function POST(req: Request) {
  const { 
    model, 
    messages, 
    webSearch 
  }: { 
    messages: UIMessage[]; 
    model: selectedModel;
    webSearch?: boolean;
  } = await req.json();

  const modelToUse = selectedModel || 'gpt-4o';


  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();
}