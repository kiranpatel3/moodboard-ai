import { relationJsonSchema, type CardContentInput, type RelationPayload } from '../types/relation.js';
import { generateGeminiContent } from './geminiGenerate.js';
import {
  buildRelationUserPrompt,
  parseRelationPayload,
  RELATION_SYSTEM_PROMPT,
} from './relationPrompt.js';

export async function generateRelation(
  cardA: CardContentInput,
  cardB: CardContentInput,
): Promise<RelationPayload> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const userPrompt = buildRelationUserPrompt(cardA, cardB);

  const response = await generateGeminiContent({
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
