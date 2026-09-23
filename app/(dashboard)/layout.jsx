import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/shared/Sidebar';
import TopNav from '@/components/shared/TopNav';
import GuestBanner from '@/components/shared/GuestBanner';

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  const isGuest = Boolean(user?.is_anonymous);

  return (
    <div className="bg-mesh flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav email={isGuest ? 'Guest' : user?.email ?? ''} />
        {isGuest && <GuestBanner />}
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
