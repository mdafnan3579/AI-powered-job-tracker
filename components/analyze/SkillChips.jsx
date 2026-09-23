import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const pop = (i) => ({ animationDelay: `${Math.min(i, 20) * 45}ms` });

export default function SkillChips({ matchedSkills, missingSkills }) {
  const matched = matchedSkills ?? [];
  const missing = missingSkills ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section aria-label="Matched skills">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Matched skills ({matched.length})
        </h3>
        <ul className="flex flex-wrap gap-2">
          {matched.length === 0 && <li className="text-sm text-muted-foreground">None found.</li>}
          {matched.map((skill, i) => (
            <li key={`m-${skill}`} className="animate-pop" style={pop(i)}>
              <Badge
                aria-label={`Matched skill: ${skill}`}
                className="border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800 transition-transform hover:scale-105"
              >
                <Check className="size-3" aria-hidden="true" />
                {skill}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Missing skills">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <span className="size-2 rounded-full bg-rose-500" aria-hidden="true" />
          Missing skills ({missing.length})
        </h3>
        <ul className="flex flex-wrap gap-2">
          {missing.length === 0 && <li className="text-sm text-muted-foreground">None — great match!</li>}
          {missing.map((skill, i) => (
            <li key={`x-${skill}`} className="animate-pop" style={pop(i)}>
              <Badge
                aria-label={`Missing skill: ${skill}`}
                className="border-rose-200 bg-rose-50 px-2.5 py-1 text-rose-800 transition-transform hover:scale-105"
              >
                <X className="size-3" aria-hidden="true" />
                {skill}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
