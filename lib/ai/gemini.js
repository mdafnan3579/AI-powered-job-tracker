import { GoogleGenerativeAI } from '@google/generative-ai';

let client = null;

function getClient() {
  if (!client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not configured.');
    client = new GoogleGenerativeAI(key);
  }
  return client;
}

// Model name lives in one env var so it can be swapped without refactoring.
export function getModel(modelName, generationConfig, timeout = 45000) {
  return getClient().getGenerativeModel(
    { model: modelName || process.env.AI_MODEL || 'gemini-3-flash-preview', generationConfig },
    { timeout }
  );
}

const MAX_ATTEMPT_MS = 45000;
const TOTAL_BUDGET_MS = 58000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// AI_MODEL first, then AI_FALLBACK_MODELS (comma separated), then built-in defaults.
function modelChain() {
  const configured = [process.env.AI_MODEL, ...(process.env.AI_FALLBACK_MODELS ?? '').split(',')];
  const defaults = ['gemini-3-flash-preview', 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
  return [...new Set([...configured, ...defaults].map((m) => m?.trim()).filter(Boolean))];
}

const isTimeout = (err) => /timed? ?out|abort/i.test(String(err?.message ?? '')) || err?.name === 'AbortError';
const isOverloaded = (err) =>
  [429, 500, 503, 504].includes(err?.status) || /overloaded|high demand|unavailable|fetch failed/i.test(String(err?.message ?? ''));
const isMissingModel = (err) => err?.status === 404 || err?.status === 400;

// Gemini's 503 "high demand" errors are short spikes: retry the same model with backoff,
// then fall back to the next model. Slow models get whatever time budget is left.
// Throws the last error (with .status) if everything fails or the time budget runs out.
export async function generateText(prompt, { json = false } = {}) {
  const started = Date.now();
  const remaining = () => TOTAL_BUDGET_MS - (Date.now() - started);
  let lastError = null;

  for (const name of modelChain()) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (remaining() < 8000) throw lastError ?? new Error('AI request timed out.');
      try {
        const model = getModel(name, json ? { responseMimeType: 'application/json' } : undefined, Math.min(MAX_ATTEMPT_MS, remaining()));
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
        if (isMissingModel(err)) break; // model gone: next model
        if (isTimeout(err)) break; // too slow: next model
        if (!isOverloaded(err)) throw err; // e.g. bad API key: stop
        await wait(1000 * (attempt + 1)); // transient overload: retry same model
      }
    }
  }
  throw lastError ?? new Error('No AI model available.');
}
