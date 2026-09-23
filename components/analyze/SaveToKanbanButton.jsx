'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KanbanSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAnalysisStore } from '@/store/analysisStore';

export default function SaveToKanbanButton() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const { analysis, jobDescription, resumeText } = useAnalysisStore.getState();
    if (!analysis) return;
    setSaving(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: analysis?.jobTitle ?? 'Untitled role',
          company: analysis?.company ?? null,
          job_description: jobDescription ?? '',
          resume_used: resumeText ?? '',
          status: 'applied',
          match_score: Math.round(Number(analysis?.matchScore) || 0),
          matched_skills: analysis?.matchedSkills ?? [],
          missing_skills: analysis?.missingSkills ?? [],
          match_summary: analysis?.matchSummary ?? '',
          tailored_resume: analysis?.tailoredResume ?? '',
          cover_letter: analysis?.coverLetter ?? '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Could not save application.');
      toast.success('Saved to your applications');
      router.push('/applications');
    } catch (err) {
      toast.error(err?.message ?? 'Could not save application.');
      setSaving(false);
    }
  };

  return (
    <Button type="button" onClick={save} disabled={saving}>
      {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <KanbanSquare className="size-4" aria-hidden="true" />}
      {saving ? 'Saving…' : 'Save to applications'}
    </Button>
  );
}
