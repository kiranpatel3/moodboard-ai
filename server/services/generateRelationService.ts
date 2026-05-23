import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema';
import {
  relationJsonSchema,
  type CardContentInput,
  type RelationPayload,
} from '../types/relation.js';
import { buildRelationPrompt, parseRelationPayload } from './relationPrompt.js';

type AiProvider = 'google' | 'anthropic';

function getProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === 'google' || provider === 'anthropic') {
    return provider;
  }

  if (process.env.GEMINI_API_KEY) {
    return 'google';
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return 'anthropic';
  }

  throw new Error('No AI provider configured');
}

async function generateWithGoogle(
  cardA: CardContentInput,
  cardB: CardContentInput,
): Promise<RelationPayload> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildRelationPrompt(cardA, cardB);

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: relationJsonSchema,
    },
  });

  if (!response.text) {
    throw new Error('AI response did not include text content');
  }

  return parseRelationPayload(response.text);
}

async function generateWithAnthropic(
  cardA: CardContentInput,
  cardB: CardContentInput,
): Promise<RelationPayload> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const client = new Anthropic({ apiKey });
  const prompt = buildRelationPrompt(cardA, cardB);

  const response = await client.messages.parse({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
    output_config: {
      format: jsonSchemaOutputFormat(relationJsonSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error('AI response could not be parsed into the expected schema');
  }

  return parseRelationPayload(JSON.stringify(response.parsed_output));
}

export async function generateRelation(
  cardA: CardContentInput,
  cardB: CardContentInput,
): Promise<RelationPayload> {
  const provider = getProvider();

  if (provider === 'google') {
    return generateWithGoogle(cardA, cardB);
  }

  return generateWithAnthropic(cardA, cardB);
}
