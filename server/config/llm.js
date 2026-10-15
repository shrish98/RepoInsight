import { ChatGroq } from '@langchain/groq';

// Groq shut down llama-3.3-70b-versatile on 2026-08-16. gpt-oss-120b is its recommended
// replacement. When this one is retired too, set GROQ_MODEL instead of editing code.
export const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export const createChatModel = (options = {}) =>
  new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: GROQ_MODEL,
    temperature: 0,
    ...options,
  });
