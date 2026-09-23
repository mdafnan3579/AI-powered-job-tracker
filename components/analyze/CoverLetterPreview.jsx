'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CopyButton from '@/components/shared/CopyButton';
import DownloadButtons from '@/components/shared/DownloadButtons';
import { useAnalysisStore } from '@/store/analysisStore';

export default function CoverLetterPreview() {
  const analysis = useAnalysisStore((s) => s.analysis);
  const value = analysis?.coverLetter ?? '';
  const setAnalysis = useAnalysisStore((s) => s.setAnalysis);

  const onChange = (e) => {
    setAnalysis({ ...(analysis ?? {}), coverLetter: e.target.value });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="cover-letter">Cover letter</Label>
        <div className="flex flex-wrap items-center gap-2">
          <DownloadButtons text={value} baseName={`${analysis?.company ?? "company"}-${analysis?.jobTitle ?? "role"}-cover-letter`} />
          <CopyButton text={value} />
        </div>
      </div>
      <Textarea id="cover-letter" className="h-72 resize-y" value={value} onChange={onChange} />
      <p className="text-right text-xs text-muted-foreground">{value.length.toLocaleString()} characters</p>
    </div>
  );
}
