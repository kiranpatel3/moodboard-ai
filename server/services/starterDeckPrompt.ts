import type {
  StarterDeckCard,
  StarterDeckCardInput,
  StarterDeckPayload,
} from '../types/starterDeck.js';

const GENRE_GUIDELINES = `Apply these creative guidelines based on the selected genre:

- Wholesome or Inspirational: Focus on uplifting narrative arcs, quirky characters with big dreams, and cozy, bright settings.
- Rom-Com: Focus on charmingly flawed characters, high-friction/high-humor relationship potentials, and vibrant urban or small-town settings.
- Mystery: Introduce intriguing character motives, hidden secrets, and atmosphere-heavy locations.
- Fantasy: Weave vibrant magical rules, mythical backgrounds, and fantastical landscapes.`;

export function buildStarterDeckSystemPrompt(genre: string, seed: string): string {
  return `You are a master worldbuilding and storytelling engine. The user has selected the creative genre: ${genre}. Based on this choice, generate highly tailored, creative card sets.

${GENRE_GUIDELINES}

Generate exactly 3 highly distinct character archetypes, 3 unique plot hooks, and 3 immersive world settings. Every card should feel native to the "${genre}" genre while sharing cohesive narrative threads so any combination can be assembled into a compelling story.

CRITICAL: You must generate an entirely unique dataset for this request. Do not repeat standard, cliché archetypes. Use the randomness seed ${seed} to creatively brainstorm unexpected, fresh character concepts, plot combinations, and settings tailored to this genre.

Request uniqueness seed: ${seed}

Respond only with JSON that matches the required schema. Do not include markdown, code fences, or commentary outside the JSON object.`;
}

export function buildStarterDeckUserPrompt(genre: string): string {
  return `Creative genre: ${genre}

Generate a starter deck with these categorical arrays:
- characters: exactly 3 character cards tailored to "${genre}"
- plots: exactly 3 plot hook cards tailored to "${genre}"
- settings: exactly 3 setting cards tailored to "${genre}"

Each card must include:
- title: a concise, evocative title
- content: a detailed, vivid description aligned with the genre guidelines above
- tags: 2-5 lowercase tags reflecting shared narrative threads across the full deck`;
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
      typeof record.title !== 'string' ||
      record.title.trim() === '' ||
      typeof record.content !== 'string' ||
      record.content.trim() === '' ||
      !Array.isArray(record.tags) ||
      !record.tags.every((tag) => typeof tag === 'string' && tag.trim())
    ) {
      throw new Error(`AI response contains an invalid ${type} card at index ${index}`);
    }

    const id =
      typeof record.id === 'string' && record.id.trim() !== ''
        ? record.id.trim()
        : '';

    return {
      id,
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
