import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import connectionsRouter from './routes/connections.js';
import generateRelationRouter from './routes/generateRelation.js';
import generateStarterDeckRouter from './routes/generateStarterDeck.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  if (!isProduction) {
    origins.add('http://localhost:5173');
    origins.add('http://localhost:5174');
    origins.add('http://127.0.0.1:5173');
    origins.add('http://127.0.0.1:5174');
    origins.add('http://localhost:3000');
  }

  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/$/, '');
  if (frontendUrl) {
    origins.add(frontendUrl);
  }

  return [...origins];
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/connections', connectionsRouter);
app.use('/api/generate-relation', generateRelationRouter);
app.use('/api/generate-starter-deck', generateStarterDeckRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (isProduction && !process.env.FRONTEND_URL) {
    console.warn('Warning: FRONTEND_URL is not set; CORS may block frontend requests.');
  }
});
