import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import connectionsRouter from './routes/connections.js';
import generateRelationRouter from './routes/generateRelation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/connections', connectionsRouter);
app.use('/api/generate-relation', generateRelationRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
