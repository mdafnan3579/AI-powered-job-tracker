'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STAGES = [
  { key: 'applied', label: 'Applied' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'rejected', label: 'Rejected' },
];

export default function StageFunnelChart({ applications }) {
  const data = STAGES.map(({ key, label }) => ({
    stage: label,
    count: (applications ?? []).filter((a) => a?.status === key).length,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications by stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full" role="img" aria-label="Bar chart of applications per stage">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
              <Tooltip />
              <Bar dataKey="count" fill="url(#barGrad)" radius={[8, 8, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
