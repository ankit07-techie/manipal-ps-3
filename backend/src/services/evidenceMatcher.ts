import { EvidenceStatus } from '../types.js';

export interface EvidenceVerificationResult {
  status: EvidenceStatus;
  matchedText?: string;
  matchScore: number; // 1.0 = exact, 0.8+ = approximate, < 0.7 = unverified
  startIndex?: number;
  endIndex?: number;
}

/**
 * Normalizes text by removing non-alphanumeric characters and collapsing multiple whitespace/newlines
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifies if an AI-extracted quote actually exists in the raw document text.
 * Ensures zero hallucination and high evidence fidelity as specified in PRD Section 8.
 */
export function verifyEvidenceQuote(quote: string, rawDocumentText: string): EvidenceVerificationResult {
  if (!quote || !quote.trim()) {
    return { status: 'unverified', matchScore: 0 };
  }

  const trimmedQuote = quote.trim();

  // Tier 1: Exact Verbatim Substring Match
  const exactIndex = rawDocumentText.indexOf(trimmedQuote);
  if (exactIndex !== -1) {
    return {
      status: 'verified',
      matchedText: trimmedQuote,
      matchScore: 1.0,
      startIndex: exactIndex,
      endIndex: exactIndex + trimmedQuote.length,
    };
  }

  // Tier 2: Case-Insensitive Substring Match
  const lowerDoc = rawDocumentText.toLowerCase();
  const lowerQuote = trimmedQuote.toLowerCase();
  const caseIndex = lowerDoc.indexOf(lowerQuote);
  if (caseIndex !== -1) {
    return {
      status: 'verified',
      matchedText: rawDocumentText.substring(caseIndex, caseIndex + trimmedQuote.length),
      matchScore: 0.98,
      startIndex: caseIndex,
      endIndex: caseIndex + trimmedQuote.length,
    };
  }

  // Tier 3: Whitespace / Punctuation Normalized Match
  const normDoc = normalizeString(rawDocumentText);
  const normQuote = normalizeString(trimmedQuote);

  if (normQuote.length >= 15 && normDoc.includes(normQuote)) {
    return {
      status: 'approximate',
      matchedText: trimmedQuote,
      matchScore: 0.88,
    };
  }

  // Tier 4: Token Sliding Window Match for Multi-sentence Quotes
  const quoteTokens = normQuote.split(' ').filter((t) => t.length > 2);
  if (quoteTokens.length >= 4) {
    const startSnippet = quoteTokens.slice(0, 3).join(' ');
    const endSnippet = quoteTokens.slice(-3).join(' ');

    if (normDoc.includes(startSnippet) && normDoc.includes(endSnippet)) {
      return {
        status: 'approximate',
        matchedText: trimmedQuote,
        matchScore: 0.80,
      };
    }
  }

  // If no credible match in raw text, mark as unverified
  return {
    status: 'unverified',
    matchScore: 0.0,
  };
}
