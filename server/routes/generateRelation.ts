import { Router } from 'express';
import type { CardContentInput } from '../types/relation.js';
import { generateRelation } from '../services/generateRelationService.js';

const router = Router();

const validCardTypes = new Set(['character', 'setting', 'plot']);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseCardInput(value: unknown): CardContentInput | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (!isNonEmptyString(record.title) || !isNonEmptyString(record.content)) {
    return null;
  }

  const card: CardContentInput = {
    title: record.title.trim(),
    content: record.content.trim(),
  };

  if (record.type !== undefined) {
    if (typeof record.type !== 'string' || !validCardTypes.has(record.type)) {
      return null;
    }

    card.type = record.type as CardContentInput['type'];
  }

  if (record.tags !== undefined) {
    if (
      !Array.isArray(record.tags) ||
      !record.tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0)
    ) {
      return null;
    }

    card.tags = record.tags.map((tag) => tag.trim());
  }

  return card;
}

router.post('/', async (req, res) => {
  try {
    const cardA = parseCardInput(req.body?.cardA);
    const cardB = parseCardInput(req.body?.cardB);

    if (!cardA || !cardB) {
      res.status(400).json({
        error:
          'Request body must include cardA and cardB, each with non-empty title and content strings.',
        code: 'INVALID_REQUEST_BODY',
      });
      return;
    }

    const relation = await generateRelation(cardA, cardB);

    res.json(relation);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown generation error';

    if (message.includes('ANTHROPIC_API_KEY is not configured')) {
      res.status(503).json({
        error: 'AI generation service is unavailable. Configure ANTHROPIC_API_KEY.',
        code: 'AI_SERVICE_UNAVAILABLE',
      });
      return;
    }

    if (
      message.includes('could not be parsed') ||
      message.includes('AI response missing')
    ) {
      console.error('[generate-relation] parse error:', message);
      res.status(502).json({
        error: 'AI returned an invalid response format.',
        code: 'AI_RESPONSE_INVALID',
      });
      return;
    }

    console.error('[generate-relation]', message);
    res.status(502).json({
      error: 'Failed to generate narrative relationship.',
      code: 'AI_GENERATION_FAILED',
    });
  }
});

export default router;
