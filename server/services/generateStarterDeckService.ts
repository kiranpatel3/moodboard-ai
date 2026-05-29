import Anthropic from '@anthropic-ai/sdk';
import { jsonSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/json-schema';
import { starterDeckJsonSchema, type StarterDeckPayload } from '../types/starterDeck.js';
import {
  buildStarterDeckSystemPrompt,
  buildStarterDeckUserPrompt,
  ensureUniqueIds,
  parseStarterDeckPayload,
} from './starterDeckPrompt.js';

const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-20241022';

export async function generateStarterDeck(genre: string): Promise<StarterDeckPayload> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const client = new Anthropic({ apiKey });
  const systemPrompt = buildStarterDeckSystemPrompt(genre);
  const userPrompt = buildStarterDeckUserPrompt(genre);

  const response = await client.messages.parse({
    model: process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      format: jsonSchemaOutputFormat(starterDeckJsonSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error('AI response could not be parsed into the expected schema');
  }

  const parsed = parseStarterDeckPayload(JSON.stringify(response.parsed_output));

  return ensureUniqueIds(parsed);
}
