import type { CardContentInput, RelationPayload } from '../types/relation.js';

function formatCard(label: string, card: CardContentInput): string {
  const typeLine = card.type ? `Type: ${card.type}\n` : '';
  const tagsLine =
    card.tags && card.tags.length > 0
      ? `Tags: ${card.tags.join(', ')}\n`
      : '';

  return `${label}:
${typeLine}${tagsLine}Title: ${card.title}
Content: ${card.content}`;
}

export function buildRelationPrompt(
  cardA: CardContentInput,
  cardB: CardContentInput,
): string {
  return `You are a narrative design assistant for a story moodboard.

Analyze the narrative relationship between the two story cards below.

${formatCard('Card A', cardA)}

${formatCard('Card B', cardB)}

Respond with a strict JSON object only. Do not include markdown, code fences, or commentary.

The JSON must match this shape exactly:
{
  "relationshipType": string,
  "summary": string,
  "description": string,
  "themes": string[],
  "narrativeHooks": string[]
}

Guidelines:
- Infer how the cards connect as character, setting, and/or plot elements.
- Keep "summary" to one sentence.
- Make "description" vivid and specific to both cards.
- Include 2-4 themes and 2-3 narrative hooks.`;
}

export function parseRelationPayload(raw: string): RelationPayload {
  const parsed: unknown = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response was not a JSON object');
  }

  const record = parsed as Record<string, unknown>;

  const requiredStringFields = [
    'relationshipType',
    'summary',
    'description',
  ] as const;

  for (const field of requiredStringFields) {
    if (typeof record[field] !== 'string' || record[field].trim() === '') {
      throw new Error(`AI response missing valid "${field}"`);
    }
  }

  if (!Array.isArray(record.themes) || !record.themes.every((t) => typeof t === 'string')) {
    throw new Error('AI response missing valid "themes" array');
  }

  if (
    !Array.isArray(record.narrativeHooks) ||
    !record.narrativeHooks.every((hook) => typeof hook === 'string')
  ) {
    throw new Error('AI response missing valid "narrativeHooks" array');
  }

  return {
    relationshipType: record.relationshipType as string,
    summary: record.summary as string,
    description: record.description as string,
    themes: record.themes as string[],
    narrativeHooks: record.narrativeHooks as string[],
  };
}
