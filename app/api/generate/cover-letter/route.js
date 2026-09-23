import { generateText } from '@/lib/ai/gemini';
import { generateCoverLetterPrompt } from '@/lib/ai/prompts';
import { getAuth, unauthorized, fail, validateInputs, sanitize, aiFailure, throttled } from '@/lib/api';

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
        generateCoverLetterPrompt(
          input.jobDescription,
          input.resumeText,
          sanitize(body?.jobTitle).slice(0, 200),
          sanitize(body?.company).slice(0, 200)
        )
      );
      const coverLetter = result.replace(/```[a-z]*/gi, '').trim();
      return Response.json({ coverLetter });
    } catch (err) {
      return aiFailure(err, "Cover letter generation failed. Please try again.");
    }
  } catch (err) {
    return fail(err);
  }
}
