'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

// Anonymous Supabase sign-in: a real (but email-less) user, so RLS and saving still work.
export default function GuestButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const { error } = await createClient().auth.signInAnonymously();
      if (error) throw error;
      router.push('/analyze');
      router.refresh();
    } catch (err) {
      const raw = String(err?.message ?? '');
      toast.error(
        /anonymous/i.test(raw)
          ? 'Guest access is not enabled yet. Enable "Allow anonymous sign-ins" in Supabase (Authentication > Sign In / Providers).'
          : raw || 'Could not start a guest session.'
      );
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" className="w-full" onClick={start} disabled={loading}>
      <UserRound className="size-4" aria-hidden="true" />
      {loading ? 'Starting…' : 'Use as guest'}
    </Button>
  );
}
