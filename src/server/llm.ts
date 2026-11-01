import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini client strictly with User-Agent header for telemetry
export const ai = new GoogleGenAI({
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
 * Works seamlessly in both Express (server.ts) and Vercel Serverless Functions (/api/llm/call.ts).
 */
export async function callLLM(prompt: string, data: any): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. If deploying to Vercel, please go to Project Settings -> Environment Variables, add GEMINI_API_KEY, and redeploy.'
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
