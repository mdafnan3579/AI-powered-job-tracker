import { getAuth, unauthorized, fail } from '@/lib/api';

const STATUSES = ['applied', 'interview', 'offer', 'rejected'];

export async function PATCH(req, { params }) {
  try {
    const { supabase, user } = await getAuth();
    if (!user) return unauthorized();
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const status = body?.status;
    if (!STATUSES.includes(status)) return fail(`Status must be one of: ${STATUSES.join(', ')}.`, 400);

    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .maybeSingle();
    if (error) return fail(error.message, 400);
    if (!data) return fail('Application not found.', 404);
    return Response.json({ status: data.status });
  } catch (err) {
    return fail(err);
  }
}
