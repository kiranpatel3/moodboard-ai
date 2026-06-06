import { relationJsonSchema, type CardContentInput, type RelationPayload } from '../types/relation.js';
import { gemini } from '../geminiClient.js';
import {
  buildRelationUserPrompt,
  parseRelationPayload,
  RELATION_SYSTEM_PROMPT,
} from './relationPrompt.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export async function generateRelation(
  cardA: CardContentInput,
  cardB: CardContentInput,
): Promise<RelationPayload> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const userPrompt = buildRelationUserPrompt(cardA, cardB);

  const response = await gemini.models.generateContent({
    model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: RELATION_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseSchema: relationJsonSchema,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error('AI response could not be parsed into the expected schema');
  }

  return parseRelationPayload(text);
}
