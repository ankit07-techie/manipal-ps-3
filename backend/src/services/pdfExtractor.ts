import pdfParse from 'pdf-parse';

export interface ExtractedDocument {
  rawText: string;
  characterCount: number;
  wordCount: number;
  pageCount?: number;
  preview: string;
}

export async function extractTextFromBuffer(buffer: Buffer, mimeType?: string): Promise<ExtractedDocument> {
  if (mimeType === 'application/pdf' || buffer.slice(0, 4).toString() === '%PDF') {
    try {
      const data = await pdfParse(buffer);
      const rawText = data.text ? data.text.trim() : '';
      if (!rawText || rawText.length < 50) {
        throw new Error('Extracted PDF content is too short or appears to be a scanned image without selectable text.');
      }
      return {
        rawText,
        characterCount: rawText.length,
        wordCount: rawText.split(/\s+/).filter(Boolean).length,
        pageCount: data.numpages,
        preview: rawText.slice(0, 500),
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from PDF: ${err.message || err}`);
    }
  }

  // Treat as UTF-8 plain text
  const text = buffer.toString('utf-8').trim();
  if (!text || text.length < 20) {
    throw new Error('Provided document text is empty or too short for policy analysis.');
  }

  return {
    rawText: text,
    characterCount: text.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    preview: text.slice(0, 500),
  };
}
