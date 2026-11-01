import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client strictly with User-Agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function callLLM(prompt: string, data: any): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on Vercel. Please open your Vercel Dashboard -> Project Settings -> Environment Variables, add GEMINI_API_KEY, and redeploy.'
    );
  }

  const promptAndData = `PROMPT:\n${prompt}\n\nDATA RECEIVED:\n${
    typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  }`;

  const systemInstruction = `You are an AI specialist in the Hospital Patient Experience Intelligence System.
RULES FOR ALL AGENTS:
- The data is synthetic (made up for class).
- Use only the data you receive. Do not invent numbers, facts, or diagnoses. Do not give medical advice.
- Focus on hospital management: service, communication, access, fairness, and risk.
- If something is unclear, contradictory, or high-risk, say so and recommend human review.
- Keep answers short. Return ONLY valid JSON in the requested schema. No code fences, no extra commentary.`;

  // Priority candidate models: gemini-3.5-flash-lite, gemini-3.8-flash
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

      // 9-second timeout per candidate
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout waiting for ${model}`)), 9000)
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
      console.warn(`[Vercel Serverless ${model}]:`, err?.message || err);
    }
  }

  throw lastError || new Error('All model candidates failed on Vercel.');
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { prompt, data, agentId, agentName } = body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Missing prompt parameter' });
    }

    const result = await callLLM(prompt, data);
    return res.status(200).json({
      success: true,
      agentId: agentId || null,
      agentName: agentName || null,
      result,
    });
  } catch (error: any) {
    console.error('[Vercel Serverless Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal AI generation failure on Vercel',
    });
  }
}
