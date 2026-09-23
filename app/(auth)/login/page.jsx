'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestButton from '@/components/auth/GuestButton';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'link_expired') {
      toast.error('That link has expired. Please request a new one.');
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      toast.success('Signed in');
      router.push('/analyze');
      router.refresh();
    } catch (err) {
      const msg = err?.message ?? 'Could not sign in.';
      setError(msg);
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <p className="text-center text-sm text-muted-foreground">Sign in to your account</p>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GuestButton />
      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <Link href="/signup" className="font-medium text-foreground underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
