import type {
  StarterDeckCard,
  StarterDeckCardInput,
  StarterDeckPayload,
} from '../types/starterDeck.js';

export const STARTER_DECK_SYSTEM_PROMPT = `You are an advanced interactive story engine. Based on the user's chosen genre, generate 3 highly distinct character archetypes, 3 unique plot hooks, and 3 immersive world settings. Make sure they all share common narrative threads so they can be combined cohesively.

Respond only with JSON that matches the required schema. Do not include markdown, code fences, or commentary outside the JSON object.`;

export function buildStarterDeckUserPrompt(genre: string): string {
  return `Genre: ${genre}

Generate a starter deck with:
- characters: 3 highly distinct character archetypes
- plots: 3 unique plot hooks
- settings: 3 immersive world settings

Each item must include:
- id: a unique temporary string identifier
- title: a concise title
- content: a detailed, vivid description
- tags: 2-5 tags that reflect shared narrative threads across the full deck`;
}

function parseCardList(
  cards: unknown,
  type: StarterDeckCard['type'],
): StarterDeckCard[] {
  if (!Array.isArray(cards)) {
    throw new Error(`AI response missing valid "${type}" array`);
  }

  return cards.map((card, index) => {
    if (!card || typeof card !== 'object') {
      throw new Error(`AI response contains an invalid ${type} card at index ${index}`);
    }

    const record = card as Record<string, unknown>;

    if (
      typeof record.id !== 'string' ||
      record.id.trim() === '' ||
      typeof record.title !== 'string' ||
      record.title.trim() === '' ||
      typeof record.content !== 'string' ||
      record.content.trim() === '' ||
      !Array.isArray(record.tags) ||
      !record.tags.every((tag) => typeof tag === 'string' && tag.trim())
    ) {
      throw new Error(`AI response contains an invalid ${type} card at index ${index}`);
    }

    return {
      id: record.id.trim(),
      type,
      title: record.title.trim(),
      content: record.content.trim(),
      tags: record.tags.map((tag) => tag.trim()),
    };
  });
}

export function parseStarterDeckPayload(raw: string): StarterDeckPayload {
  const parsed: unknown = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response was not a JSON object');
  }

  const record = parsed as Record<string, unknown>;

  const characters = parseCardList(record.characters, 'character');
  const plots = parseCardList(record.plots, 'plot');
  const settings = parseCardList(record.settings, 'setting');

  return { characters, plots, settings };
}

export function ensureUniqueIds(payload: StarterDeckPayload): StarterDeckPayload {
  const usedIds = new Set<string>();

  const normalizeCards = (cards: StarterDeckCardInput[], type: StarterDeckCard['type']) =>
    cards.map((card) => {
      let id = card.id.trim();

      if (!id || usedIds.has(id)) {
        id = crypto.randomUUID();
      }

      usedIds.add(id);

      return {
        ...card,
        id,
        type,
      };
    });

  return {
    characters: normalizeCards(payload.characters, 'character'),
    plots: normalizeCards(payload.plots, 'plot'),
    settings: normalizeCards(payload.settings, 'setting'),
  };
}
