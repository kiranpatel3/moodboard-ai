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
  relationDescription: string;
  suggestedTags: string[];
}

export const relationJsonSchema = {
  type: 'object',
  properties: {
    relationDescription: {
      type: 'string',
      description:
        'A vivid paragraph describing the narrative relationship between the two story cards.',
    },
    suggestedTags: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Short lowercase tags (2-5) that capture themes, dynamics, or story hooks implied by the relationship.',
    },
  },
  required: ['relationDescription', 'suggestedTags'],
  additionalProperties: false,
} as const;
