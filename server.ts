import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { callLLM } from './src/server/llm.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { callLLM };

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
    });
  });

  // Universal callLLM endpoint
  app.post('/api/llm/call', async (req: Request, res: Response) => {
    const { prompt, data, agentId, agentName } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Missing prompt parameter' });
    }

    try {
      const result = await callLLM(prompt, data);
      return res.json({
        success: true,
        agentId: agentId || null,
        agentName: agentName || null,
        result,
      });
    } catch (error: any) {
      console.error(`[callLLM Error for ${agentName || agentId || 'Agent'}]:`, error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal AI generation failure',
      });
    }
  });

  // Mount Vite middleware in dev or serve dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital Patient Experience Intelligence server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
