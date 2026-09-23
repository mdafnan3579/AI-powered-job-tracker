'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { error: authError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (authError) throw authError;
      setSent(true);
      toast.success('Reset link sent');
    } catch (err) {
      const msg = err?.message ?? 'Could not send the reset email.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-4 space-y-3 text-center">
        <MailCheck className="mx-auto size-10 text-indigo-600" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, we sent a link to reset your
          password.
        </p>
        <Link href="/login" className="text-sm font-medium underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <p className="text-center text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link</p>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send reset link'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
