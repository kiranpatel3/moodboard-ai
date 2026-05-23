export type CardType = 'character' | 'setting' | 'plot';

export interface CardContentInput {
  title: string;
  content: string;
  type?: CardType;
  tags?: string[];
}

export interface GenerateRelationRequest {
  cardA: CardContentInput;
  cardB: CardContentInput;
}

export interface RelationPayload {
  relationshipType: string;
  summary: string;
  description: string;
  themes: string[];
  narrativeHooks: string[];
}

export const relationJsonSchema = {
  type: 'object',
  properties: {
    relationshipType: {
      type: 'string',
      description:
        'A concise label for how the two cards relate (e.g. "mentor-student", "setting-for-conflict").',
    },
    summary: {
      type: 'string',
      description: 'One-sentence overview of the narrative relationship.',
    },
    description: {
      type: 'string',
      description:
        'A detailed paragraph describing how these story elements interact narratively.',
    },
    themes: {
      type: 'array',
      items: { type: 'string' },
      description: 'Shared or contrasting themes between the two cards.',
    },
    narrativeHooks: {
      type: 'array',
      items: { type: 'string' },
      description: 'Actionable story hooks or plot beats implied by this relationship.',
    },
  },
  required: [
    'relationshipType',
    'summary',
    'description',
    'themes',
    'narrativeHooks',
  ],
  additionalProperties: false,
} as const;
