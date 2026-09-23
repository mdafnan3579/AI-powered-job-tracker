'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAnalysisStore } from '@/store/analysisStore';

const MAX = 8000;

export default function ResumeInput() {
  const resumeText = useAnalysisStore((s) => s.resumeText);
  const setResumeText = useAnalysisStore((s) => s.setResumeText);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [noBaseResume, setNoBaseResume] = useState(false);

  // On mount: if the store already has text (e.g. saved on the Resume page) it is shown as-is;
  // otherwise fall back to the saved base resume from the profile.
  useEffect(() => {
    if (useAnalysisStore.getState().resumeText) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        const base = data?.base_resume ?? '';
        if (res.ok && base && !useAnalysisStore.getState().resumeText) setResumeText(base);
        else if (!base) setNoBaseResume(true);
      } catch {
        // profile is optional; ignore network errors here
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setResumeText]);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Upload failed.');
      setResumeText(data?.text ?? '');
      toast.success('Resume loaded from file');
    } catch (err) {
      toast.error(err?.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const over = (resumeText?.length ?? 0) > MAX;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="resume-input">Resume</Label>
        <input
          ref={fileRef}
          id="resume-file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          aria-label="Upload resume (PDF or Word)"
          onChange={onFile}
        />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" aria-hidden="true" />
          {uploading ? 'Uploading…' : 'Upload Resume (PDF / Word)'}
        </Button>
      </div>
      <Textarea
        id="resume-input"
        className="h-72 resize-y"
        placeholder="Paste your resume here…"
        value={resumeText ?? ''}
        onChange={(e) => setResumeText(e.target.value)}
      />
      <div className="flex items-start justify-between gap-2 text-xs">
        {noBaseResume && !resumeText ? (
          <p className="text-muted-foreground">
            <Link href="/resume" className="underline">
              Save your base resume
            </Link>{' '}
            to speed up future analyses.
          </p>
        ) : (
          <span />
        )}
        <p className={`shrink-0 ${over ? 'text-destructive' : 'text-muted-foreground'}`}>
          {(resumeText?.length ?? 0).toLocaleString()} / {MAX.toLocaleString()} characters
          {over ? ' — too long, please trim' : ''}
        </p>
      </div>
    </div>
  );
}
