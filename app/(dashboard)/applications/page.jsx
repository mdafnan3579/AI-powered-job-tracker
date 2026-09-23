'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { useApplications } from '@/hooks/useApplications';

const DAY = 24 * 60 * 60 * 1000;

export default function ApplicationsPage() {
  const { applications, isLoading, error, retry, updateStatus } = useApplications();
  const [filter, setFilter] = useState('all');
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    if (filter === 'all') return applications;
    const cutoff = now - (filter === 'week' ? 7 : 30) * DAY;
    return applications.filter((a) => {
      const t = new Date(a?.applied_date ?? a?.created_at ?? 0).getTime();
      return t >= cutoff;
    });
  }, [applications, filter, now]);

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Applications <span className="text-base font-normal text-muted-foreground">({filtered.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-filter">Show</Label>
          <select
            id="date-filter"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-3xl border bg-white/60 p-8 text-center backdrop-blur">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={retry}>
            Retry
          </Button>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border bg-white/60 p-8 text-center backdrop-blur">
          <p className="text-sm text-muted-foreground">No applications yet.</p>
          <Button asChild>
            <Link href="/analyze">Analyze your first job</Link>
          </Button>
        </div>
      ) : (
        <KanbanBoard applications={filtered} updateStatus={updateStatus} />
      )}
    </div>
  );
}
