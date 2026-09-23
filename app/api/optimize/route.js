import { generateText } from '@/lib/ai/gemini';
import { optimizePrompt } from '@/lib/ai/prompts';
import { safeParse } from '@/lib/ai/parser';
import { getAuth, unauthorized, fail, validateInputs, sanitize, aiFailure, throttled } from '@/lib/api';

export const runtime = 'nodejs';
export const maxDuration = 60;

const cleanList = (list, max = 50) =>
  (Array.isArray(list) ? list : [])
    .map((s) => sanitize(s).slice(0, 80))
    .filter(Boolean)
    .slice(0, max);

export async function POST(req) {
  try {
    const { user } = await getAuth();
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const input = validateInputs(body);
    if (input.error) return fail(input.error, input.status);

    const approvedSkills = cleanList(body?.approvedSkills);
    if (approvedSkills.length === 0) return fail('Select at least one skill to add.', 400);

    if (throttled(user.id)) return fail('Rate limit hit. Please wait a few seconds and try again.', 429);

    const analysis = {
      matchedSkills: cleanList(body?.matchedSkills, 100),
      missingSkills: cleanList(body?.missingSkills, 100),
    };

    try {
      const raw = await generateText(
        optimizePrompt(input.jobDescription, input.resumeText, approvedSkills, analysis),
        { json: true }
      );
      const out = safeParse(raw, null);
      if (!out?.tailoredResume || !out?.coverLetter)
        return fail('The AI returned an unreadable response. Please try again.', 502);
      return Response.json({
        tailoredResume: String(out.tailoredResume),
        coverLetter: String(out.coverLetter),
        matchScore: Math.max(0, Math.min(100, Math.round(Number(out.matchScore) || 0))),
        matchSummary: String(out.matchSummary ?? ''),
      });
    } catch (err) {
      return aiFailure(err, 'Optimization failed. Please try again.');
    }
  } catch (err) {
    return fail(err);
  }
}
