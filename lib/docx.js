import mammoth from 'mammoth';

const DOCX_ERROR = 'Could not read this Word file. Please save it as .docx (or PDF) or paste the text instead.';

export async function extractTextFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = (result?.value ?? '').trim();
    if (!text) throw new Error(DOCX_ERROR);
    return text;
  } catch {
    throw new Error(DOCX_ERROR);
  }
}
