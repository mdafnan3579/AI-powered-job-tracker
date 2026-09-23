import { PDFParse } from 'pdf-parse';

const NO_TEXT_ERROR = 'Could not extract text from this PDF. Please paste your resume as text instead.';

export async function extractTextFromPDF(buffer) {
  let parser;
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    const text = (result?.text ?? '').trim();
    if (!text) throw new Error(NO_TEXT_ERROR);
    return text;
  } catch (err) {
    if (err?.message === NO_TEXT_ERROR) throw err;
    throw new Error(NO_TEXT_ERROR);
  } finally {
    try {
      await parser?.destroy();
    } catch {
      // ignore cleanup errors
    }
  }
}
