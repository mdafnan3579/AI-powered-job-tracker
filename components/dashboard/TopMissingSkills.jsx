import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMissingSkillFrequency } from '@/lib/utils';

export default function TopMissingSkills({ applications }) {
  const skills = getMissingSkillFrequency(applications);
  const max = skills[0]?.[1] ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top missing skills</CardTitle>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No missing skills recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {skills.map(([skill, count], i) => (
              <li key={skill} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 truncate sm:w-40" title={skill}>
                  {skill}
                </span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-3 origin-left animate-grow-x rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                    style={{ width: `${(count / max) * 100}%`, animationDelay: `${i * 70}ms` }}
                    role="img"
                    aria-label={`${skill}: missing in ${count} applications`}
                  />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
