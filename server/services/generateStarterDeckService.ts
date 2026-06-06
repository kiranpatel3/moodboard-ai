import { geminiStarterDeckResponseSchema, type StarterDeckPayload } from '../types/starterDeck.js';
import { gemini } from '../geminiClient.js';
import {
  buildStarterDeckSystemPrompt,
  buildStarterDeckUserPrompt,
  ensureUniqueIds,
  parseStarterDeckPayload,
} from './starterDeckPrompt.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export async function generateStarterDeck(
  genre: string,
  seed: string,
): Promise<StarterDeckPayload> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const systemInstruction = buildStarterDeckSystemPrompt(genre, seed);
  const userPrompt = buildStarterDeckUserPrompt(genre);

  const response = await gemini.models.generateContent({
    model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: geminiStarterDeckResponseSchema,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error('AI response could not be parsed into the expected schema');
  }

  const parsed = parseStarterDeckPayload(text);

  return ensureUniqueIds(parsed);
}
