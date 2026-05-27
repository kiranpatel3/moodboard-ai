import type { CardContentInput, RelationPayload } from '../types/relation.js';

export const RELATION_SYSTEM_PROMPT = `You are a narrative design assistant for a collaborative story moodboard.

Evaluate the storytelling relationship between two moodboard cards. Consider how characters, settings, and plot threads interact, conflict, or reinforce one another.

Respond only with JSON that matches the required schema. Do not include markdown, code fences, or commentary outside the JSON object.`;

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

export function buildRelationUserPrompt(
  cardA: CardContentInput,
  cardB: CardContentInput,
): string {
  return `Analyze the narrative relationship between these two moodboard cards:

${formatCard('Card A', cardA)}

${formatCard('Card B', cardB)}

Return:
- relationDescription: one detailed paragraph explaining how these elements connect in the story
- suggestedTags: 2-5 concise tags describing the relationship dynamic or themes`;
}

export function parseRelationPayload(raw: string): RelationPayload {
  const parsed: unknown = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response was not a JSON object');
  }

  const record = parsed as Record<string, unknown>;

  if (
    typeof record.relationDescription !== 'string' ||
    record.relationDescription.trim() === ''
  ) {
    throw new Error('AI response missing valid "relationDescription"');
  }

  if (
    !Array.isArray(record.suggestedTags) ||
    !record.suggestedTags.every((tag) => typeof tag === 'string' && tag.trim())
  ) {
    throw new Error('AI response missing valid "suggestedTags" array');
  }

  return {
    relationDescription: record.relationDescription.trim(),
    suggestedTags: record.suggestedTags.map((tag) => tag.trim()),
  };
}
