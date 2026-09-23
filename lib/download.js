const safeName = (s) =>
  String(s ?? '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'document';

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTxt(text, baseName) {
  saveBlob(new Blob([text ?? ''], { type: 'text/plain;charset=utf-8' }), `${safeName(baseName)}.txt`);
}

export async function downloadPdf(text, baseName) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 50;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  let y = margin;
  for (const line of doc.splitTextToSize(String(text ?? ''), width)) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }
  doc.save(`${safeName(baseName)}.pdf`);
}

export async function downloadDocx(text, baseName) {
  const { Document, Packer, Paragraph, TextRun } = await import('docx');
  const paragraphs = String(text ?? '')
    .split(/\r?\n/)
    .map((line) => new Paragraph({ children: [new TextRun({ text: line, font: 'Calibri', size: 22 })] }));
  const doc = new Document({ sections: [{ children: paragraphs }] });
  saveBlob(await Packer.toBlob(doc), `${safeName(baseName)}.docx`);
}
