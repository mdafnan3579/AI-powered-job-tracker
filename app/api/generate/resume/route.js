import { generateText } from '@/lib/ai/gemini';
import { generateResumePrompt } from '@/lib/ai/prompts';
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
      const result = await generateText(
        generateResumePrompt(input.jobDescription, input.resumeText, body?.existingAnalysis ?? null)
      );
      const tailoredResume = result.replace(/```[a-z]*/gi, '').trim();
      return Response.json({ tailoredResume });
    } catch (err) {
      return aiFailure(err, "Resume generation failed. Please try again.");
    }
  } catch (err) {
    return fail(err);
  }
}
