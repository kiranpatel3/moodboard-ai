import Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema';
import {
  relationJsonSchema,
  type CardContentInput,
  type RelationPayload,
} from '../types/relation.js';
import {
  buildRelationUserPrompt,
  parseRelationPayload,
  RELATION_SYSTEM_PROMPT,
} from './relationPrompt.js';

const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-20241022';

export async function generateRelation(
  cardA: CardContentInput,
  cardB: CardContentInput,
): Promise<RelationPayload> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const client = new Anthropic({ apiKey });
  const userPrompt = buildRelationUserPrompt(cardA, cardB);

  const response = await client.messages.parse({
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: RELATION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      format: jsonSchemaOutputFormat(relationJsonSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error('AI response could not be parsed into the expected schema');
  }

  return parseRelationPayload(JSON.stringify(response.parsed_output));
}
