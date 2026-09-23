'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, KanbanSquare, LayoutDashboard, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analyze', label: 'Analyze', icon: Sparkles },
  { href: '/applications', label: 'Applications', icon: KanbanSquare },
  { href: '/resume', label: 'Resume', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 animate-fade-in bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/40">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Hireflow
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-4" aria-label="Main navigation">
          {LINKS.map(({ href, label, icon: Icon }, i) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
                style={{ animationDelay: `${i * 70}ms` }}
                className={cn(
                  'group flex animate-fade-up items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-300 hover:translate-x-1 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <p className="px-5 pb-5 text-xs text-slate-500">Analyze · Tailor · Track</p>
      </aside>
    </>
  );
}
