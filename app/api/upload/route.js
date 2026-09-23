import { extractTextFromPDF } from '@/lib/pdf';
import { extractTextFromDocx } from '@/lib/docx';
import { getAuth, unauthorized, fail } from '@/lib/api';

export const runtime = 'nodejs';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req) {
  try {
    const { user } = await getAuth();
    if (!user) return unauthorized();

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return fail('A file is required.', 400);
    if (file.size > MAX_SIZE) return fail('File is too large. Maximum size is 5MB.', 413);

    const name = String(file.name ?? '').toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    // Detect by content first: PDFs start with "%PDF", .docx files are ZIP archives ("PK").
    const isPdf = buffer.subarray(0, 4).toString() === '%PDF';
    const isDocx = buffer.subarray(0, 2).toString() === 'PK' && name.endsWith('.docx');

    if (!isPdf && !isDocx) {
      if (name.endsWith('.doc'))
        return fail('Old .doc files are not supported. Please save it as .docx or PDF and upload again.', 415);
      return fail('Unsupported file type. Upload a PDF or Word (.docx) file.', 415);
    }

    try {
      const text = isPdf ? await extractTextFromPDF(buffer) : await extractTextFromDocx(buffer);
      return Response.json({ text });
    } catch (err) {
      return fail(err, 422);
    }
  } catch (err) {
    return fail(err);
  }
}
