import { EvidenceStatus, SourceOffsets } from '../types.js';

export interface EvidenceVerificationResult {
  status: EvidenceStatus;
  matchedText?: string;
  sourceOffsets?: SourceOffsets;
  matchScore: number; // 1.0 = exact, 0.90 = contiguous normalized match, 0.0 = unverified
  verificationDetails?: string;
}

interface DocumentToken {
  normalized: string;
  start: number;
  end: number;
}

/**
 * Normalizes an individual word token (lowercase alphanumeric)
 */
function normalizeWord(token: string): string {
  return token.toLowerCase().replace(/[^\w]/g, '');
}

/**
 * Tokenizes raw text while retaining character start and end offsets in the original document
 */
function tokenizeWithOffsets(text: string): DocumentToken[] {
  const tokens: DocumentToken[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawWord = match[0];
    const norm = normalizeWord(rawWord);
    if (norm.length > 0) {
      tokens.push({
        normalized: norm,
        start: match.index,
        end: match.index + rawWord.length,
      });
    }
  }

  return tokens;
}

/**
 * Verifies if an AI-extracted quote actually exists in the raw document text.
 * Enforces strict contiguous passage matching with token order preserved.
 * Strictly rejects reordered tokens, disconnected spliced fragments, and fabricated quotes.
 */
export function verifyEvidenceQuote(quote: string, rawDocumentText: string): EvidenceVerificationResult {
  if (!quote || typeof quote !== 'string') {
    return {
      status: 'unverified',
      matchScore: 0.0,
      verificationDetails: 'Empty or invalid quotation provided.',
    };
  }

  const trimmedQuote = quote.trim();
  const quoteTokens = trimmedQuote
    .split(/\s+/)
    .map(normalizeWord)
    .filter((t) => t.length > 0);

  // Reject empty, single punctuation, or excessively short inputs
  if (trimmedQuote.length < 3 || quoteTokens.length === 0) {
    return {
      status: 'unverified',
      matchScore: 0.0,
      verificationDetails: 'Quotation has insufficient alphanumeric content.',
    };
  }

  // Tier 1: Exact Verbatim Substring Match
  const exactIndex = rawDocumentText.indexOf(trimmedQuote);
  if (exactIndex !== -1) {
    return {
      status: 'verified',
      matchedText: trimmedQuote,
      sourceOffsets: {
        start_char: exactIndex,
        end_char: exactIndex + trimmedQuote.length,
      },
      matchScore: 1.0,
      verificationDetails: 'Verbatim character-by-character match in source text.',
    };
  }

  // Tier 2: Case-Insensitive Verbatim Substring Match
  const lowerDoc = rawDocumentText.toLowerCase();
  const lowerQuote = trimmedQuote.toLowerCase();
  const caseIndex = lowerDoc.indexOf(lowerQuote);
  if (caseIndex !== -1) {
    return {
      status: 'verified',
      matchedText: rawDocumentText.substring(caseIndex, caseIndex + trimmedQuote.length),
      sourceOffsets: {
        start_char: caseIndex,
        end_char: caseIndex + trimmedQuote.length,
      },
      matchScore: 1.0,
      verificationDetails: 'Exact case-insensitive match in source text.',
    };
  }

  // Tier 3: Strict Contiguous Token Sequence Match (handles whitespace/line-break & punctuation variations)
  const docTokens = tokenizeWithOffsets(rawDocumentText);

  if (quoteTokens.length > 0 && docTokens.length >= quoteTokens.length) {
    const qLen = quoteTokens.length;

    for (let i = 0; i <= docTokens.length - qLen; i++) {
      let isContiguousMatch = true;

      for (let j = 0; j < qLen; j++) {
        if (docTokens[i + j].normalized !== quoteTokens[j]) {
          isContiguousMatch = false;
          break;
        }
      }

      if (isContiguousMatch) {
        const startChar = docTokens[i].start;
        const endChar = docTokens[i + qLen - 1].end;
        const matchedSnippet = rawDocumentText.substring(startChar, endChar);

        return {
          status: 'approximate',
          matchedText: matchedSnippet,
          sourceOffsets: {
            start_char: startChar,
            end_char: endChar,
          },
          matchScore: 0.90,
          verificationDetails: 'Contiguous token sequence match across punctuation or whitespace differences.',
        };
      }
    }
  }

  // Tier 4: Rejection
  // Quotes with reordered words, non-contiguous spliced fragments, or fabricated text are rejected
  return {
    status: 'unverified',
    matchScore: 0.0,
    verificationDetails: 'Quotation could not be located as a contiguous passage in the source document.',
  };
}
