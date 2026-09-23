import { getAuth, unauthorized, fail, APPLICATION_FIELDS } from '@/lib/api';

export async function GET(_req, { params }) {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();
    const { id } = await params;

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) return fail(error.message);
    if (!data) return fail('Application not found.', 404);
    return Response.json(data);
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req, { params }) {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const updates = {};
    for (const key of APPLICATION_FIELDS) {
      if (body?.[key] !== undefined) updates[key] = body[key];
    }
    if (Object.keys(updates).length === 0) return fail('No valid fields to update.', 400);

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) return fail(error.message, 400);
    if (!data) return fail('Application not found.', 404);
    return Response.json(data);
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();
    const { id } = await params;

    const { data, error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id');
    if (error) return fail(error.message);
    if (!data?.length) return fail('Application not found.', 404);
    return Response.json({ success: true });
  } catch (err) {
    return fail(err);
  }
}
