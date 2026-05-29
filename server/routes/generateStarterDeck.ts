import { Router } from 'express';
import { generateStarterDeck } from '../services/generateStarterDeckService.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const genre =
      typeof req.body?.genre === 'string' && req.body.genre.trim().length > 0
        ? req.body.genre.trim()
        : 'speculative fiction';

    const starterDeck = await generateStarterDeck(genre);

    res.json(starterDeck);
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
      message.includes('AI response missing') ||
      message.includes('AI response contained') ||
      message.includes('invalid')
    ) {
      console.error('[generate-starter-deck] parse error:', message);
      res.status(502).json({
        error: 'AI returned an invalid starter deck format.',
        code: 'AI_RESPONSE_INVALID',
      });
      return;
    }

    console.error('[generate-starter-deck]', message);
    res.status(502).json({
      error: 'Failed to generate starter deck.',
      code: 'AI_GENERATION_FAILED',
    });
  }
});

export default router;
