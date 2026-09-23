import { getAuth, unauthorized, fail, APPLICATION_FIELDS } from '@/lib/api';

export async function GET() {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return fail(error.message);
    return Response.json(data ?? []);
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req) {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const row = { user_id: user.id };
    for (const key of APPLICATION_FIELDS) {
      if (body?.[key] !== undefined) row[key] = body[key];
    }
    if (!row.job_title) row.job_title = 'Untitled role';
    if (!row.job_description) return fail('job_description is required.', 400);

    // applications.user_id references profiles(id); make sure the row exists.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true });
    if (profileError) return fail(profileError.message);

    const { data, error } = await supabase.from('applications').insert(row).select().single();
    if (error) return fail(error.message, 400);
    return Response.json(data, { status: 201 });
  } catch (err) {
    return fail(err);
  }
}
