'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // The emailed link signs the user in (via /auth/callback); without a session the link was invalid or expired.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await createClient().auth.getUser();
        if (!cancelled) setHasSession(Boolean(data?.user));
      } catch {
        if (!cancelled) setHasSession(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const { error: authError } = await createClient().auth.updateUser({ password });
      if (authError) throw authError;
      toast.success('Password updated');
      router.push('/analyze');
      router.refresh();
    } catch (err) {
      const msg = err?.message ?? 'Could not update the password.';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (!ready) return <Skeleton className="mt-4 h-40 w-full" />;

  if (!hasSession) {
    return (
      <div className="mt-4 space-y-3 text-center">
        <h2 className="text-lg font-semibold">Link expired</h2>
        <p className="text-sm text-muted-foreground">This reset link is invalid or has expired. Please request a new one.</p>
        <Link href="/forgot-password" className="text-sm font-medium underline">
          Send a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <p className="text-center text-sm text-muted-foreground">Choose a new password</p>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}
