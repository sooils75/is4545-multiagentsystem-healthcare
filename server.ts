import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini client strictly with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Universal Server-Side callLLM function
 * All agent AI calls route through this single function so the AI provider
 * can be changed or extended in one centralized place.
 */
export async function callLLM(prompt: string, data: any): Promise<any> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.');
  }

  const promptAndData = `PROMPT:\n${prompt}\n\nDATA RECEIVED:\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;

  const systemInstruction = `You are an AI specialist in the Hospital Patient Experience Intelligence System.
RULES FOR ALL AGENTS:
- The data is synthetic (made up for class).
- Use only the data you receive. Do not invent numbers, facts, or diagnoses. Do not give medical advice.
- Focus on hospital management: service, communication, access, fairness, and risk.
- If something is unclear, contradictory, or high-risk, say so and recommend human review.
- Keep answers short. Return ONLY valid JSON in the requested schema. No code fences, no extra commentary.`;

  // Priority candidate models: gemini-3.8-flash, gemini-3.5-flash-lite
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const responsePromise = ai.models.generateContent({
        model,
        contents: promptAndData,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      // 8-second timeout per model candidate
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout waiting for ${model}`)), 8000)
      );

      const response: any = await Promise.race([responsePromise, timeoutPromise]);

      const rawText = (response?.text ?? '').trim();
      if (!rawText) {
        throw new Error('Model returned an empty response.');
      }

      try {
        return JSON.parse(rawText);
      } catch {
        const cleaned = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        return JSON.parse(cleaned);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Model candidate ${model}]:`, err?.message || err);
    }
  }

  throw lastError || new Error('All model candidates failed.');
}

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
