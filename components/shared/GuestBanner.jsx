'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

// Shown to guests. Adding an email + password upgrades the same user, so nothing they saved is lost.
export default function GuestBanner() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const upgrade = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await createClient().auth.updateUser({ email, password });
      if (error) throw error;
      setSent(true);
      toast.success('Check your email to confirm your account');
    } catch (err) {
      toast.error(err?.message ?? 'Could not create the account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Info className="size-4 shrink-0" aria-hidden="true" />
        <span>You&apos;re using a guest session. Your data is lost if you clear your browser data or sign out.</span>
        {!sent && !open && (
          <button type="button" className="font-semibold underline" onClick={() => setOpen(true)}>
            Create an account to keep it
          </button>
        )}
      </div>
      {sent && (
        <p className="mt-2">
          We sent a confirmation link to <strong>{email}</strong>. Click it to finish; everything you&apos;ve saved will be kept.
        </p>
      )}
      {open && !sent && (
        <form onSubmit={upgrade} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="guest-email">Email</Label>
            <Input id="guest-email" type="email" required autoComplete="email" className="w-56 bg-white" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="guest-password">Password</Label>
            <Input id="guest-password" type="password" required minLength={6} autoComplete="new-password" className="w-56 bg-white" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create account'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
