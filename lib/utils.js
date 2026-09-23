import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getMissingSkillFrequency = (applications) => {
  const freq = {};
  for (const app of applications ?? []) {
    for (const skill of app?.missing_skills ?? []) {
      freq[skill] = (freq[skill] ?? 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
};

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Thresholds from SCOPE.md 4.3: red < 50, yellow 50–75, green > 75
export function getScoreColor(score) {
  const s = score ?? 0;
  if (s < 50) return 'red';
  if (s <= 75) return 'yellow';
  return 'green';
}

export function truncate(text, maxLength) {
  const t = text ?? '';
  return t.length > maxLength ? `${t.slice(0, maxLength).trimEnd()}…` : t;
}
