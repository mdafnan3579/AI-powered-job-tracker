'use client';

import { Award, BarChart3, Briefcase, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CountUp from '@/components/shared/CountUp';

export default function StatsBar({ applications }) {
  const apps = applications ?? [];
  const total = apps.length;
  const scored = apps.filter((a) => a?.match_score != null);
  const avg = scored.length ? Math.round(scored.reduce((sum, a) => sum + (a.match_score ?? 0), 0) / scored.length) : 0;
  // An application that reached "offer" also went through an interview.
  const interviews = apps.filter((a) => a?.status === 'interview' || a?.status === 'offer').length;
  const offers = apps.filter((a) => a?.status === 'offer').length;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  const stats = [
    { label: 'Total Applied', value: total, suffix: '', icon: Briefcase, tint: 'from-indigo-500 to-blue-500' },
    { label: 'Average Score', value: avg, suffix: '%', icon: BarChart3, tint: 'from-violet-500 to-fuchsia-500' },
    { label: 'Interview Rate', value: pct(interviews), suffix: '%', icon: Users, tint: 'from-amber-500 to-orange-500' },
    { label: 'Offer Rate', value: pct(offers), suffix: '%', icon: Award, tint: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, suffix, icon: Icon, tint }, i) => (
        <Card key={label} className="animate-fade-up hover:-translate-y-1" style={{ animationDelay: `${i * 90}ms` }}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-2xl bg-gradient-to-br ${tint} p-3 shadow-lg`}>
              <Icon className="size-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-3xl font-bold leading-none">
                <CountUp value={value} suffix={suffix} />
              </p>
              <p className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
