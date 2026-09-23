'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalysis } from '@/hooks/useAnalysis';

// Asks permission before adding missing skills to the resume and cover letter.
export default function MissingSkillsList() {
  const { analysis, optimize, isLoading } = useAnalysis();
  const missing = analysis?.missingSkills ?? [];
  const approvedBefore = analysis?.approvedSkills ?? [];
  const [selected, setSelected] = useState([]);
  const [confirmed, setConfirmed] = useState(false);

  if (missing.length === 0 && approvedBefore.length === 0) return null;

  const picked = selected.filter((s) => missing.includes(s));
  const toggle = (skill) => setSelected((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  const allSelected = missing.length > 0 && picked.length === missing.length;

  const apply = async () => {
    const ok = await optimize(picked);
    if (ok) {
      setSelected([]);
      setConfirmed(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="size-4" aria-hidden="true" />
          Add missing skills &amp; make it ATS-friendly
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose which missing skills you want added. Your resume and cover letter will be rewritten around the job
          description&apos;s keywords in a plain, ATS-friendly format. Unselected skills are never added.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvedBefore.length > 0 && (
          <p className="flex items-start gap-2 text-sm text-green-700">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Already added: {approvedBefore.join(', ')}
          </p>
        )}

        {missing.length > 0 && (
          <>
            <fieldset disabled={isLoading} className="space-y-2">
              <legend className="sr-only">Missing skills to add</legend>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? [] : [...missing])}
                />
                Select all ({missing.length})
              </label>
              <ul className="grid gap-2 sm:grid-cols-2">
                {missing.map((skill) => (
                  <li key={skill}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-white/70 p-2.5 text-sm transition-all hover:border-indigo-300 hover:bg-accent has-[:checked]:border-indigo-400 has-[:checked]:bg-indigo-50">
                      <input type="checkbox" checked={picked.includes(skill)} onChange={() => toggle(skill)} />
                      {skill}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={isLoading}
              />
              <span>
                I confirm I have real experience with the selected skills and I&apos;m happy for them to appear on my
                resume and cover letter.
              </span>
            </label>

            <Button type="button" onClick={apply} disabled={isLoading || picked.length === 0 || !confirmed}>
              {isLoading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Wand2 className="size-4" aria-hidden="true" />}
              {isLoading ? 'Updating… (this takes a few seconds)' : `Add ${picked.length || ''} selected skill${picked.length === 1 ? '' : 's'} & regenerate`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
