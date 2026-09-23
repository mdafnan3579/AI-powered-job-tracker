import { createClient } from '@/lib/supabase/server';

export const LIMITS = { jobDescription: 10000, resumeText: 8000 };

// Returns { supabase, user } or { supabase, user: null }
export async function getAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user: user ?? null };
}

export const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 });

export const fail = (error, status = 500) =>
  Response.json({ error: error instanceof Error ? error.message : String(error ?? 'Unexpected error') }, { status });

// Strip <script> tags before sending user text to the model.
export const sanitize = (text) =>
  String(text ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?script[^>]*>/gi, '')
    .trim();

export const isRateLimitError = (err) =>
  err?.status === 429 || /429|quota|rate limit|too many requests/i.test(String(err?.message ?? ''));

// Simple in-memory per-user throttle (one AI call per 5s) to stay under Gemini's 15 RPM.
const lastCall = new Map();
export function throttled(userId, ms = 5000) {
  const now = Date.now();
  const prev = lastCall.get(userId) ?? 0;
  if (now - prev < ms) return true;
  lastCall.set(userId, now);
  if (lastCall.size > 1000) {
    for (const [k, t] of lastCall) if (now - t > ms) lastCall.delete(k);
  }
  return false;
}

// Validate JD + resume; returns { error, status } or { jobDescription, resumeText }
export function validateInputs(body) {
  const jobDescription = sanitize(body?.jobDescription);
  const resumeText = sanitize(body?.resumeText);
  if (!jobDescription) return { error: 'Job description is required.', status: 400 };
  if (!resumeText) return { error: 'Resume text is required.', status: 400 };
  if (jobDescription.length > LIMITS.jobDescription)
    return { error: `Job description must be under ${LIMITS.jobDescription} characters.`, status: 400 };
  if (resumeText.length > LIMITS.resumeText)
    return { error: `Resume must be under ${LIMITS.resumeText} characters.`, status: 400 };
  return { jobDescription, resumeText };
}

export const APPLICATION_FIELDS = [
  'job_title',
  'company',
  'job_description',
  'resume_used',
  'status',
  'match_score',
  'matched_skills',
  'missing_skills',
  'match_summary',
  'tailored_resume',
  'cover_letter',
  'applied_date',
  'next_action_date',
  'notes',
];

// Maps an AI-provider error to a user-facing response. Never includes prompt content.
export function aiFailure(err, fallbackMessage) {
  if (isRateLimitError(err)) return fail('Rate limit hit. Please wait a few seconds and try again.', 429);
  if ([500, 503, 504].includes(err?.status) || /high demand|unavailable|timed? ?out|abort/i.test(String(err?.message ?? '')))
    return fail('The AI service is busy right now. Please try again in a moment.', 503);
  if (err?.status === 401 || err?.status === 403) return fail('The Gemini API key was rejected. Check GEMINI_API_KEY.', 502);
  return fail(fallbackMessage, 502);
}
