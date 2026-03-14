/**
 * Claude API helper — aizstāj @google/genai
 * Izmanto Anthropic /v1/messages endpointu
 */
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeOptions {
  system?: string;
  maxTokens?: number;
  webSearch?: boolean;
  jsonMode?: boolean;
}

export async function claudeGenerate(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const response = await fetch("https://juridiskie-atzinumi-api.onrender.com/api/claude", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API kļūda: ${response.status} — ${err}`);
  }
  const data = await response.json();
  return data.answer || '';
}

export async function claudeChat(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<string> {
  const prompt = messages[messages.length - 1]?.content || '';
  return claudeGenerate(prompt, options);
}