'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

function TrendTooltip({ active, payload }) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-md border bg-card p-2 text-xs shadow">
      <p className="font-semibold">{p.company ?? 'Unknown company'}</p>
      <p className="text-muted-foreground">{p.job_title ?? ''}</p>
      <p>
        {formatDate(p.applied_date)} · Score {p.match_score}%
      </p>
    </div>
  );
}

export default function ScoreTrendChart({ applications }) {
  const data = (applications ?? [])
    .filter((a) => a?.match_score != null && a?.applied_date)
    .sort((a, b) => new Date(a.applied_date) - new Date(b.applied_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match score over time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full" role="img" aria-label="Line chart of match score over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="applied_date" tick={{ fontSize: 11 }} tickFormatter={(v) => formatDate(v)} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
              <Tooltip content={<TrendTooltip />} />
              <Line type="monotone" dataKey="match_score" stroke="url(#trendGrad)" strokeWidth={3} dot={{ r: 4, fill: "#7c3aed", strokeWidth: 0 }} activeDot={{ r: 6 }} animationDuration={1400} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
