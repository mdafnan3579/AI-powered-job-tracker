'use client';

import { useEffect, useId, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CountUp from '@/components/shared/CountUp';
import { getScoreColor } from '@/lib/utils';

const GRADIENTS = {
  red: ['#f43f5e', '#f97316'],
  yellow: ['#f59e0b', '#facc15'],
  green: ['#10b981', '#06b6d4'],
};
const TEXTS = { red: 'text-red-600', yellow: 'text-yellow-600', green: 'text-emerald-600' };
const LABELS = { red: 'Needs work', yellow: 'Good match', green: 'Great match' };

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SkillMatchCard({ score, matchSummary }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  const color = getScoreColor(value);
  const [from, to] = GRADIENTS[color];
  const gradId = useId();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const offset = CIRCUMFERENCE * (1 - animated / 100);

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-6 p-6 sm:flex-row">
        <div className="relative shrink-0">
          <div
            className="absolute inset-3 rounded-full opacity-30 blur-xl"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            aria-hidden="true"
          />
          <svg className="relative" width="160" height="160" viewBox="0 0 140 140" role="img" aria-label={`Match score: ${value}%`}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={from} />
                <stop offset="100%" stopColor={to} />
              </linearGradient>
            </defs>
            <circle cx="70" cy="70" r={RADIUS} fill="none" strokeWidth="12" className="stroke-muted" />
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              stroke={`url(#${gradId})`}
              className="transition-[stroke-dashoffset] duration-[1400ms] ease-out"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${TEXTS[color]}`} aria-hidden="true">
            <span className="text-4xl font-bold leading-none">
              <CountUp value={value} duration={1200} />
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">out of 100</span>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <p className={`text-lg font-bold ${TEXTS[color]}`}>{LABELS[color]}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{matchSummary ?? ''}</p>
        </div>
      </CardContent>
    </Card>
  );
}
