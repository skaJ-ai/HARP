import { createOpenAI } from '@ai-sdk/openai';

function getChatModel() {
  const apiUrl = process.env.LLM_API_URL;
  const modelName = process.env.LLM_MODEL;

  if (!apiUrl) {
    throw new Error('LLM_API_URL is not configured.');
  }

  if (!modelName) {
    throw new Error('LLM_MODEL is not configured.');
  }

  const apiKey = process.env.LLM_API_KEY?.trim() ?? '';
  const apiKeyHeader = process.env.LLM_API_KEY_HEADER?.trim() || 'Authorization';

  const provider = createOpenAI({
    apiKey: apiKey || 'unused',
    baseURL: apiUrl,
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      headers.delete('authorization');

      if (apiKey) {
        if (apiKeyHeader.toLowerCase() === 'authorization') {
          headers.set('Authorization', `Bearer ${apiKey}`);
        } else {
          headers.set(apiKeyHeader, apiKey);
        }
      }

      return globalThis.fetch(input, { ...init, headers });
    },
    name: 'harp-qwen',
  });

  return provider.chat(modelName);
}

export { getChatModel };
