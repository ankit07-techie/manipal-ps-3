import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export interface ExtractedDocument {
  rawText: string;
  characterCount: number;
  wordCount: number;
  format: 'pdf' | 'docx' | 'text';
  pageCount?: number;
  preview: string;
}

const MAX_BUFFER_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB upload limit
const MAX_UNCOMPRESSED_CHARS = 5_000_000; // 5M characters (~5MB text) decompression limit

/**
 * Robust document text extractor supporting PDF, DOCX (Word), and UTF-8 plain text.
 * Implements strict type validation, decompression safeguards, and table/paragraph order preservation.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType?: string,
  originalFilename?: string
): Promise<ExtractedDocument> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Submitted document buffer is empty.');
  }

  if (buffer.length > MAX_BUFFER_SIZE_BYTES) {
    throw new Error(`Document file size exceeds maximum allowed limit of ${MAX_BUFFER_SIZE_BYTES / (1024 * 1024)} MB.`);
  }

  const filenameLower = originalFilename ? originalFilename.toLowerCase() : '';
  const headerHex4 = buffer.length >= 4 ? buffer.slice(0, 4).toString('hex') : '';
  const headerHex8 = buffer.length >= 8 ? buffer.slice(0, 8).toString('hex') : '';

  // 1. Reject Legacy Binary Word (.doc) OLE Compound Document Header
  if (headerHex8 === 'd0cf11e0a1b11ae1' || filenameLower.endsWith('.doc')) {
    throw new Error('Legacy binary Word (.doc) format is not supported. Please convert the document to modern .docx or .pdf format.');
  }

  // 2. Identify Format Flags
  const isPdf =
    mimeType === 'application/pdf' ||
    buffer.slice(0, 4).toString() === '%PDF' ||
    filenameLower.endsWith('.pdf');

  const isZipOrDocx =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filenameLower.endsWith('.docx') ||
    headerHex4 === '504b0304' || // PK\x03\x04
    headerHex4 === '504b0506' || // PK\x05\x06
    headerHex4 === '504b0708';   // PK\x07\x08

  // 3. PDF Ingestion Pathway
  if (isPdf) {
    try {
      const data = await pdfParse(buffer);
      const rawText = data.text ? data.text.trim() : '';

      if (rawText.length > MAX_UNCOMPRESSED_CHARS) {
        throw new Error('Extracted PDF text exceeds maximum uncompressed safety limit.');
      }

      if (!rawText || rawText.length < 20) {
        throw new Error('Extracted PDF content is empty or appears to be a scanned image without selectable text.');
      }

      return {
        rawText,
        characterCount: rawText.length,
        wordCount: rawText.split(/\s+/).filter(Boolean).length,
        format: 'pdf',
        pageCount: data.numpages,
        preview: rawText.slice(0, 500),
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from PDF document: ${err.message || err}`);
    }
  }

  // 4. DOCX Ingestion Pathway (Office Open XML Word Document)
  if (isZipOrDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      let rawText = result.value ? result.value.trim() : '';

      // Normalize consecutive blank lines while preserving paragraph boundaries
      rawText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

      if (rawText.length > MAX_UNCOMPRESSED_CHARS) {
        throw new Error('Extracted DOCX text exceeds maximum uncompressed safety limit.');
      }

      if (!rawText || rawText.length < 20) {
        throw new Error('Extracted DOCX document is empty or contains no readable text content.');
      }

      return {
        rawText,
        characterCount: rawText.length,
        wordCount: rawText.split(/\s+/).filter(Boolean).length,
        format: 'docx',
        preview: rawText.slice(0, 500),
      };
    } catch (err: any) {
      throw new Error(`Failed to extract text from DOCX archive: ${err.message || 'Malformed or corrupted Office Open XML archive.'}`);
    }
  }

  // 5. Binary Non-Document Rejection Safeguard
  // Check for non-printable control bytes in sample window
  let nonPrintableCount = 0;
  const sampleSize = Math.min(buffer.length, 512);
  for (let i = 0; i < sampleSize; i++) {
    const byte = buffer[i];
    // Standard ASCII whitespace: tab (9), LF (10), CR (13), and printable 32..126
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      nonPrintableCount++;
    }
  }

  if (nonPrintableCount / sampleSize > 0.08) {
    throw new Error('Unsupported binary file format. Supported formats are PDF (.pdf), Word Document (.docx), and UTF-8 Text (.txt).');
  }

  // 6. UTF-8 Plain Text Pathway
  const text = buffer.toString('utf-8').trim();
  if (!text || text.length < 20) {
    throw new Error('Provided document text is empty or too short for analysis (minimum 20 characters required).');
  }

  return {
    rawText: text,
    characterCount: text.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    format: 'text',
    preview: text.slice(0, 500),
  };
}
