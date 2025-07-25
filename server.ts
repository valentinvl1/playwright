import express from 'express';
import { testBotDetection } from './main';

const app = express();

app.get('/search', async (req, res) => {
  const target = (req.query.url || req.query.q) as string | undefined;
  try {
    await testBotDetection(target);
    res.status(200).send('Test completed');
  } catch (error) {
    res.status(500).send('Error running test');
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
