export interface StarterDeckCardInput {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface StarterDeckCard extends StarterDeckCardInput {
  type: 'character' | 'plot' | 'setting';
}

export interface StarterDeckPayload {
  characters: StarterDeckCard[];
  plots: StarterDeckCard[];
  settings: StarterDeckCard[];
}

const starterDeckCardSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      description:
        'A unique temporary identifier for this suggestion (e.g. "char-1", "plot-2").',
    },
    title: {
      type: 'string',
      description: 'A concise, evocative title for the story element.',
    },
    content: {
      type: 'string',
      description:
        'A detailed description of the character, plot hook, or setting.',
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Short lowercase tags capturing themes and narrative threads shared across the deck.',
    },
  },
  required: ['id', 'title', 'content', 'tags'],
  additionalProperties: false,
} as const;

export const starterDeckJsonSchema = {
  type: 'object',
  properties: {
    characters: {
      type: 'array',
      description: 'Exactly 3 distinct character archetypes.',
      items: starterDeckCardSchema,
      minItems: 3,
      maxItems: 3,
    },
    plots: {
      type: 'array',
      description: 'Exactly 3 unique plot hooks.',
      items: starterDeckCardSchema,
      minItems: 3,
      maxItems: 3,
    },
    settings: {
      type: 'array',
      description: 'Exactly 3 immersive world settings.',
      items: starterDeckCardSchema,
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['characters', 'plots', 'settings'],
  additionalProperties: false,
} as const;
