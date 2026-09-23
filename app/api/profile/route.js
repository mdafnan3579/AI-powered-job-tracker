import { getAuth, unauthorized, fail, LIMITS } from '@/lib/api';

export async function GET() {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) return fail(error.message);
    return Response.json(data ?? { id: user.id, full_name: null, base_resume: null });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req) {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const updates = { id: user.id };
    if (body?.base_resume !== undefined) {
      const text = String(body.base_resume ?? '');
      if (text.length > LIMITS.resumeText) return fail(`Resume must be under ${LIMITS.resumeText} characters.`, 400);
      updates.base_resume = text;
    }
    if (body?.full_name !== undefined) updates.full_name = String(body.full_name ?? '').slice(0, 200);

    const { data, error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' }).select().single();
    if (error) return fail(error.message, 400);
    return Response.json(data);
  } catch (err) {
    return fail(err);
  }
}
