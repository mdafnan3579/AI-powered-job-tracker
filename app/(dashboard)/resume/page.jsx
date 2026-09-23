'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAnalysisStore } from '@/store/analysisStore';

const MAX = 8000;

export default function ResumePage() {
  const setResumeText = useAnalysisStore((s) => s.setResumeText);
  const [text, setText] = useState('');
  const [saved, setSaved] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Failed to load resume.');
      const base = data?.base_resume ?? '';
      setText(base);
      setSaved(base);
    } catch (err) {
      setError(err?.message ?? 'Failed to load resume.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    load();
  }, [load]);

  const save = async () => {
    if (saving || text === saved) return;
    if (text.length > MAX) {
      toast.error(`Resume must be under ${MAX} characters.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_resume: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? 'Could not save resume.');
      setSaved(text);
      setResumeText(text); // auto-fills the Analyze page
      toast.success('Resume saved');
    } catch (err) {
      toast.error(err?.message ?? 'Could not save resume.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Base <span className="gradient-text">resume</span></h1>
      <p className="text-sm text-muted-foreground">
        Your master resume. It saves automatically when you click away and pre-fills the Analyze page.
      </p>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="base-resume">Resume text</Label>
          <Textarea
            id="base-resume"
            className="h-96 resize-y"
            placeholder="Paste your resume here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
          />
          <div className="flex items-center justify-between">
            <p className={`text-xs ${text.length > MAX ? 'text-destructive' : 'text-muted-foreground'}`}>
              {text.length.toLocaleString()} / {MAX.toLocaleString()} characters
            </p>
            <Button type="button" onClick={save} disabled={saving || text === saved}>
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
