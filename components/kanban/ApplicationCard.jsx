'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Check, Download, Flag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CopyButton from '@/components/shared/CopyButton';
import { cn, formatDate, getScoreColor } from '@/lib/utils';

const SCORE_STYLES = {
  red: 'border-red-200 bg-red-100 text-red-800',
  yellow: 'border-yellow-200 bg-yellow-100 text-yellow-800',
  green: 'border-green-200 bg-green-100 text-green-800',
};

const STATUS_OPTIONS = [
  { id: 'applied', label: 'Applied' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text ?? ''], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ApplicationCard({ application, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application?.id,
  });

  const score = application?.match_score;
  const color = getScoreColor(score);
  const matched = application?.matched_skills ?? [];
  const missing = application?.missing_skills ?? [];

  return (
    <>
      <Card
        ref={setNodeRef}
        role="listitem"
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn('w-full cursor-grab touch-manipulation border-l-4 border-l-indigo-400 bg-white p-4 shadow-sm hover:border-l-fuchsia-500 hover:shadow-lg active:cursor-grabbing', isDragging && 'opacity-50')}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setOpen(true);
        }}
        tabIndex={0}
        aria-label={`${application?.job_title ?? 'Application'} at ${application?.company ?? 'unknown company'}`}
        {...attributes}
        {...listeners}
      >
        <CardContent className="space-y-2 p-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{application?.company ?? 'Unknown company'}</p>
              <p className="truncate text-xs text-muted-foreground">{application?.job_title ?? ''}</p>
            </div>
            {score != null && (
              <Badge className={SCORE_STYLES[color]} aria-label={`Match score ${score} percent`}>
                {score}%
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" aria-hidden="true" />
              {formatDate(application?.applied_date)}
            </span>
            {application?.next_action_date && (
              <span className="inline-flex items-center gap-1">
                <Flag className="size-3" aria-hidden="true" />
                Next: {formatDate(application.next_action_date)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{application?.job_title ?? 'Application'}</DialogTitle>
            <DialogDescription>
              {application?.company ?? 'Unknown company'} · Applied {formatDate(application?.applied_date)}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor={`status-${application?.id}`}>Status</Label>
              <select
                id={`status-${application?.id}`}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={application?.status ?? 'applied'}
                onChange={(e) => onStatusChange?.(application.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {application?.status !== 'rejected' && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange?.(application.id, 'rejected')}>
                <X className="size-4" aria-hidden="true" />
                Mark rejected
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={!application?.tailored_resume}
              onClick={() => downloadText(`${application?.company ?? 'resume'}-tailored-resume.txt`, application?.tailored_resume)}
            >
              <Download className="size-4" aria-hidden="true" />
              Download resume
            </Button>
          </div>

          {score != null && (
            <div className="space-y-1">
              <Badge className={SCORE_STYLES[color]}>Match score: {score}%</Badge>
              <p className="text-sm">{application?.match_summary ?? ''}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h4 className="mb-1 text-sm font-semibold">Matched skills</h4>
              <ul className="flex flex-wrap gap-1.5">
                {matched.length === 0 && <li className="text-xs text-muted-foreground">None</li>}
                {matched.map((s) => (
                  <li key={s}>
                    <Badge className="border-green-200 bg-green-100 text-green-800">
                      <Check className="size-3" aria-hidden="true" />
                      {s}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-semibold">Missing skills</h4>
              <ul className="flex flex-wrap gap-1.5">
                {missing.length === 0 && <li className="text-xs text-muted-foreground">None</li>}
                {missing.map((s) => (
                  <li key={s}>
                    <Badge className="border-red-200 bg-red-100 text-red-800">
                      <X className="size-3" aria-hidden="true" />
                      {s}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor={`resume-${application?.id}`}>Tailored resume</Label>
              <CopyButton text={application?.tailored_resume ?? ''} />
            </div>
            <Textarea
              id={`resume-${application?.id}`}
              readOnly
              className="h-48 font-mono text-xs"
              value={application?.tailored_resume ?? ''}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor={`cover-${application?.id}`}>Cover letter</Label>
              <CopyButton text={application?.cover_letter ?? ''} />
            </div>
            <Textarea id={`cover-${application?.id}`} readOnly className="h-40" value={application?.cover_letter ?? ''} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
