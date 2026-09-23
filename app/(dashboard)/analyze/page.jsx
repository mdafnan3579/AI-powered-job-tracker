'use client';

import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import JDInput from '@/components/analyze/JDInput';
import ResumeInput from '@/components/analyze/ResumeInput';
import SkillMatchCard from '@/components/analyze/SkillMatchCard';
import SkillChips from '@/components/analyze/SkillChips';
import MissingSkillsList from '@/components/analyze/MissingSkillsList';
import TailoredResumePreview from '@/components/analyze/TailoredResumePreview';
import CoverLetterPreview from '@/components/analyze/CoverLetterPreview';
import SaveToKanbanButton from '@/components/analyze/SaveToKanbanButton';
import { useAnalysis } from '@/hooks/useAnalysis';

const STEPS = ['Paste the job', 'Add your resume', 'Get your match'];

function AnalyzeButton() {
  const { analyze, isLoading, error } = useAnalysis();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="lg" className="relative h-12 overflow-hidden px-8 text-base" onClick={analyze} disabled={isLoading}>
          {isLoading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Sparkles className="size-5" aria-hidden="true" />}
          {isLoading ? 'Analyzing… (this takes a few seconds)' : 'Analyze'}
          {isLoading && <span className="shimmer-bar absolute inset-0" aria-hidden="true" />}
        </Button>
        {error && (
          <div role="alert" className="flex animate-pop items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={analyze} disabled={isLoading}>
              Retry
            </Button>
          </div>
        )}
      </div>
      {isLoading && (
        <div className="h-1.5 max-w-md overflow-hidden rounded-full bg-indigo-100" role="progressbar" aria-label="Analyzing">
          <div className="animate-gradient h-full w-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_100%]" />
        </div>
      )}
    </div>
  );
}

const stagger = (i) => ({ animationDelay: `${i * 110}ms` });

function AnalysisResults() {
  const { analysis } = useAnalysis();
  if (!analysis) return null;

  return (
    <section className="space-y-6" aria-label="Analysis results">
      <div className="animate-fade-up" style={stagger(0)}>
        <h2 className="gradient-text text-2xl font-bold">{analysis?.jobTitle ?? 'Analysis'}</h2>
        {analysis?.company && <p className="text-sm text-muted-foreground">{analysis.company}</p>}
      </div>
      <div className="animate-fade-up" style={stagger(1)}>
        <SkillMatchCard score={analysis?.matchScore} matchSummary={analysis?.matchSummary} />
      </div>
      <Card className="animate-fade-up" style={stagger(2)}>
        <CardContent className="p-6">
          <SkillChips matchedSkills={analysis?.matchedSkills} missingSkills={analysis?.missingSkills} />
        </CardContent>
      </Card>
      <div className="animate-fade-up" style={stagger(3)}>
        <MissingSkillsList />
      </div>
      <div className="grid animate-fade-up gap-6 lg:grid-cols-2" style={stagger(4)}>
        <Card>
          <CardContent className="p-6">
            <TailoredResumePreview />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <CoverLetterPreview />
          </CardContent>
        </Card>
      </div>
      <div className="animate-fade-up" style={stagger(5)}>
        <SaveToKanbanButton />
      </div>
    </section>
  );
}

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Analyze a <span className="gradient-text">job</span>
        </h1>
        <ol className="flex flex-wrap gap-2 text-sm">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className="flex animate-pop items-center gap-2 rounded-full border bg-white/70 px-3 py-1 shadow-sm"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <JDInput />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <ResumeInput />
          </CardContent>
        </Card>
      </div>
      <AnalyzeButton />
      <AnalysisResults />
    </div>
  );
}
