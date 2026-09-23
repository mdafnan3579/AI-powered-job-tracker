'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAnalysisStore } from '@/store/analysisStore';

export const LIMITS = { jobDescription: 10000, resumeText: 8000 };

export function useAnalysis() {
  const { jobDescription, resumeText, analysis, isLoading, error, setAnalysis, setLoading, setError } =
    useAnalysisStore();

  const analyze = useCallback(async () => {
    if (isLoading) return;
    const jd = jobDescription?.trim() ?? '';
    const resume = resumeText?.trim() ?? '';

    let message = null;
    if (!jd) message = 'Please add a job description.';
    else if (!resume) message = 'Please add your resume.';
    else if (jd.length > LIMITS.jobDescription) message = `Job description must be under ${LIMITS.jobDescription} characters.`;
    else if (resume.length > LIMITS.resumeText) message = `Resume must be under ${LIMITS.resumeText} characters.`;
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, resumeText: resume }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          res.status === 429 ? 'Too many requests — please wait a few seconds and try again' : data?.error ?? 'Analysis failed.';
        setError(msg);
        toast.error(msg);
        return;
      }
      setAnalysis(data);
      toast.success('Analysis complete');
    } catch {
      const msg = 'Network error. Check your connection and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [jobDescription, resumeText, isLoading, setAnalysis, setLoading, setError]);

  // Regenerates the resume + cover letter including skills the user explicitly approved.
  const optimize = useCallback(
    async (approvedSkills) => {
      const { analysis: current, jobDescription: jd, resumeText: resume } = useAnalysisStore.getState();
      if (!current || !approvedSkills?.length) return false;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/optimize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription: jd,
            resumeText: resume,
            approvedSkills,
            matchedSkills: current?.matchedSkills ?? [],
            missingSkills: current?.missingSkills ?? [],
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = res.status === 429 ? 'Too many requests — please wait a few seconds and try again' : data?.error ?? 'Optimization failed.';
          setError(msg);
          toast.error(msg);
          return false;
        }
        const approved = new Set(approvedSkills);
        setAnalysis({
          ...current,
          tailoredResume: data?.tailoredResume ?? current?.tailoredResume,
          coverLetter: data?.coverLetter ?? current?.coverLetter,
          matchScore: data?.matchScore ?? current?.matchScore,
          matchSummary: data?.matchSummary ?? current?.matchSummary,
          matchedSkills: [...(current?.matchedSkills ?? []), ...approvedSkills],
          missingSkills: (current?.missingSkills ?? []).filter((s) => !approved.has(s)),
          approvedSkills: [...(current?.approvedSkills ?? []), ...approvedSkills],
        });
        toast.success('Resume and cover letter updated with your approved skills');
        return true;
      } catch {
        const msg = 'Network error. Check your connection and try again.';
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [setAnalysis, setLoading, setError]
  );

  return { analyze, optimize, analysis, isLoading, error };
}
