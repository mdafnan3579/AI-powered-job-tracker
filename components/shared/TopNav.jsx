'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useUiStore } from '@/store/uiStore';

export default function TopNav({ email }) {
  const router = useRouter();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      router.push('/login');
      router.refresh();
    } catch (err) {
      toast.error(err?.message ?? 'Could not sign out.');
      setSigningOut(false);
    }
  };

  const initial = (email ?? '?').charAt(0).toUpperCase();

  return (
    <header className="glass sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
        onClick={toggleSidebar}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>
      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white shadow-md shadow-indigo-500/30"
            aria-hidden="true"
          >
            {initial}
          </span>
          <span className="hidden max-w-[220px] truncate text-sm text-muted-foreground sm:inline">{email ?? ''}</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut} disabled={signingOut}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
