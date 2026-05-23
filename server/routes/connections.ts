import { Router } from 'express';
import { upsertConnectionDescription } from '../store/connections.js';

const router = Router();

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (typeof description !== 'string') {
    res.status(400).json({ error: 'description must be a string' });
    return;
  }

  const connection = upsertConnectionDescription(id, description);
  res.json(connection);
});

export default router;
