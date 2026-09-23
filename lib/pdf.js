const NO_TEXT_ERROR = 'Could not extract text from this PDF. Please paste your resume as text instead.';

// unpdf is a serverless-friendly build of pdf.js (no native binaries), imported lazily
// so a problem loading it can never break the other upload types.
export async function extractTextFromPDF(buffer) {
  try {
    const { extractText, getDocumentProxy } = await import('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    const clean = (Array.isArray(text) ? text.join('\n') : (text ?? '')).trim();
    if (!clean) throw new Error(NO_TEXT_ERROR);
    return clean;
  } catch (err) {
    if (err?.message === NO_TEXT_ERROR) throw err;
    throw new Error(NO_TEXT_ERROR);
  }
}
