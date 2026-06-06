import { Router } from 'express';
import { generateStarterDeck } from '../services/generateStarterDeckService.js';
import { handleAiRouteError } from '../utils/aiRouteErrors.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const genre =
      typeof req.body?.genre === 'string' && req.body.genre.trim().length > 0
        ? req.body.genre.trim()
        : 'Fantasy';

    const seed = Math.random().toString(36).substring(7);

    const starterDeck = await generateStarterDeck(genre, seed);

    res.json(starterDeck);
  } catch (error) {
    handleAiRouteError(res, error, {
      logPrefix: 'generate-starter-deck',
      invalidFormatMessage: 'AI returned an invalid starter deck format.',
      failureMessage: 'Failed to generate starter deck.',
    });
  }
});

export default router;
