'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadDocx, downloadPdf, downloadTxt } from '@/lib/download';

// Download a piece of text as .pdf, .docx or .txt.
export default function DownloadButtons({ text, baseName }) {
  const [busy, setBusy] = useState(null);

  const run = async (kind, fn) => {
    setBusy(kind);
    try {
      await fn(text ?? '', baseName);
    } catch {
      toast.error(`Could not create the ${kind.toUpperCase()} file.`);
    } finally {
      setBusy(null);
    }
  };

  const disabled = !text || busy !== null;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Download ${baseName}`}>
      <Download className="size-4 text-muted-foreground" aria-hidden="true" />
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => run('pdf', downloadPdf)}>
        PDF
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => run('docx', downloadDocx)}>
        Word
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => run('txt', downloadTxt)}>
        TXT
      </Button>
    </div>
  );
}
