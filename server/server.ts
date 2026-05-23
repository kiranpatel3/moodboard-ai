import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import connectionsRouter from './routes/connections.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/connections', connectionsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
