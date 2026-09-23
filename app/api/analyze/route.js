import { generateText } from '@/lib/ai/gemini';
import { analyzePrompt } from '@/lib/ai/prompts';
import { safeParse } from '@/lib/ai/parser';
import { getAuth, unauthorized, fail, validateInputs, aiFailure, throttled } from '@/lib/api';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const { user } = await getAuth();
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const input = validateInputs(body);
    if (input.error) return fail(input.error, input.status);

    if (throttled(user.id)) return fail('Rate limit hit. Please wait a few seconds and try again.', 429);

    try {
      const raw = await generateText(analyzePrompt(input.jobDescription, input.resumeText), { json: true });
      const analysis = safeParse(raw, null);
      if (!analysis || typeof analysis !== 'object') return fail('The AI returned an unreadable response. Please try again.', 502);
      return Response.json(analysis);
    } catch (err) {
      return aiFailure(err, 'AI analysis failed. Please try again.');
    }
  } catch (err) {
    return fail(err);
  }
}
