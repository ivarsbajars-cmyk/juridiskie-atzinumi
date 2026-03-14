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

/**
 * Vienkārša Claude API izsaukšana ar teksta atbildi
 */
export async function claudeGenerate(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const { system, maxTokens = 4000, webSearch = false } = options;

  const body: any = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  };

  if (system) body.system = system;

  if (webSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }


   onst response = await fetch("https://juridiskie-atzinumi-api.onrender.com/api/claude", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API kļūda: ${response.status} — ${err}`);
  }

  const data = await response.json();
  // Savāc visus teksta blokus (web_search var ievietot starprezultātus)
  return (data.content || [])
  .filter((b: any) => b.type === 'text')
  .map((b: any) => b.text)
  .join('');
}

/**
 * Claude API izsaukšana ar sarunu vēsturi (chatbot vajadzībām)
 */
export async function claudeChat(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<string> {
  const { system, maxTokens = 2000 } = options;

  const body: any = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages,
  };

  if (system) body.system = system;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API kļūda: ${response.status} — ${err}`);
  }

  const data = await response.json();
  return data.content
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('');
}
