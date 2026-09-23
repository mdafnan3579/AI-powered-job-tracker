import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Email links (password reset, confirmation) land here with a one-time ?code=...
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/analyze';
  // Only allow same-site relative redirects.
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/analyze';

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    } catch {
      // fall through to the error redirect
    }
  }
  return NextResponse.redirect(`${origin}/login?error=link_expired`);
}
