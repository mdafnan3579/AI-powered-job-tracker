'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAnalysisStore } from '@/store/analysisStore';

const MAX = 10000;

export default function JDInput() {
  const jobDescription = useAnalysisStore((s) => s.jobDescription);
  const setJobDescription = useAnalysisStore((s) => s.setJobDescription);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

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
      setJobDescription(data?.text ?? '');
      toast.success('Job description loaded from file');
    } catch (err) {
      toast.error(err?.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const over = (jobDescription?.length ?? 0) > MAX;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor="jd-input">Job description</Label>
        <input
          ref={fileRef}
          id="jd-file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          aria-label="Upload job description (PDF or Word)"
          onChange={onFile}
        />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" aria-hidden="true" />
          {uploading ? 'Uploading…' : 'Upload JD (PDF / Word)'}
        </Button>
      </div>
      <Textarea
        id="jd-input"
        className="h-72 resize-y"
        placeholder="Paste the job description here…"
        value={jobDescription ?? ''}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <p className={`text-right text-xs ${over ? 'text-destructive' : 'text-muted-foreground'}`}>
        {(jobDescription?.length ?? 0).toLocaleString()} / {MAX.toLocaleString()} characters
        {over ? ' — too long, please trim' : ''}
      </p>
    </div>
  );
}
