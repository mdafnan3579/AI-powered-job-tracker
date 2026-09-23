'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatsBar from '@/components/dashboard/StatsBar';
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart';
import StageFunnelChart from '@/components/dashboard/StageFunnelChart';
import TopMissingSkills from '@/components/dashboard/TopMissingSkills';
import { useApplications } from '@/hooks/useApplications';

export default function DashboardPage() {
  const { applications, isLoading, error, retry } = useApplications();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Your <span className="gradient-text">dashboard</span></h1>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={retry}>
            Retry
          </Button>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border bg-white/60 p-12 text-center backdrop-blur">
          <div className="animate-float rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-5 shadow-xl shadow-indigo-500/30"><BarChart3 className="size-12 text-white" aria-hidden="true" /></div>
          <p className="text-muted-foreground">No applications yet — your stats will show up here.</p>
          <Button asChild>
            <Link href="/analyze">Analyze your first job</Link>
          </Button>
        </div>
      ) : (
        <>
          <StatsBar applications={applications} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ScoreTrendChart applications={applications} />
            <StageFunnelChart applications={applications} />
          </div>
          <TopMissingSkills applications={applications} />
        </>
      )}
    </div>
  );
}
