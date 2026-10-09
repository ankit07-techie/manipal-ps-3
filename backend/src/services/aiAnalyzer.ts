import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import {
  AnalysedClause,
  ClauseCategory,
  DetectionSource,
  InformationState,
  PolicyAnalysisResult,
  UncertaintyLabel,
} from '../types.js';
import { verifyEvidenceQuote } from './evidenceMatcher.js';
import { getStatutoryReferenceForCategory, LEGAL_DISCLAIMER_TEXT } from '../data/legalSources.js';

const CATEGORY_LABELS: Record<ClauseCategory, string> = {
  data_collection: 'Personal Data Collected',
  purpose_specification: 'Purpose & Lawful Basis',
  third_party_sharing: 'Third-Party Sharing & Transfers',
  retention_period: 'Data Retention & Storage',
  consent_and_choices: 'Consent, Preferences & Opt-Outs',
  consumer_rights: 'Consumer / Data Principal Rights',
  security_practices: 'Security & Breach Safeguards',
  grievance_contact: 'Grievance Officer & Escalation',
  other: 'General Terms',
};

const SYSTEM_PROMPT = `
You are an expert Legal AI Assistant specialized in privacy policies and the Digital Personal Data Protection Act, 2023 (DPDP Act).
Your task is to analyze the provided privacy policy document and extract structured clauses.

CRITICAL INSTRUCTIONS:
1. Every clause MUST include an EXACT quotation ('evidence_quote') from the provided text. Do not invent or paraphrase the quote.
2. Categorize each clause into one of these strict categories:
   - 'data_collection'
   - 'purpose_specification'
   - 'third_party_sharing'
   - 'retention_period'
   - 'consent_and_choices'
   - 'consumer_rights'
   - 'security_practices'
   - 'grievance_contact'
3. For each clause provide:
   - 'plain_language_explanation': clear, accessible explanation for a general consumer.
   - 'information_state': one of 'stated', 'unclear', 'not_found_in_analysed_text', 'requires_review'.
   - 'source_reference': section heading, title, or paragraph if mentioned in text.
   - 'potential_question': a constructive question the consumer might ask the company.
   - 'risk_level': 'low' | 'moderate' | 'high' | 'neutral'.
   - 'suggested_action': a brief consumer next step if relevant.
4. Output STRICT JSON format matching the schema requested.
`;

interface RawAIClause {
  category: ClauseCategory;
  plain_language_explanation: string;
  evidence_quote: string;
  source_reference?: string;
  information_state?: InformationState;
  potential_question?: string;
  risk_level?: 'low' | 'moderate' | 'high' | 'neutral';
  suggested_action?: string;
}

function computeUncertaintyLabel(
  informationState: InformationState,
  evidenceStatus: 'verified' | 'approximate' | 'unverified'
): UncertaintyLabel {
  if (informationState === 'not_found_in_analysed_text') {
    return 'unverified_omission';
  }
  if (informationState === 'unclear' || informationState === 'requires_review') {
    return 'requires_human_review';
  }
  if (evidenceStatus === 'verified') {
    return 'high_certainty';
  }
  if (evidenceStatus === 'approximate') {
    return 'moderate_uncertainty';
  }
  return 'requires_human_review';
}

/**
 * Deterministic Rule-Based Analyzer for fallback or offline demo mode
 */
function analyzeWithRuleBasedParser(rawText: string, sourceLabel: string): AnalysedClause[] {
  const clauses: AnalysedClause[] = [];

  const rules: {
    category: ClauseCategory;
    keywords: string[];
    exclusions?: string[];
    ambiguousTriggers?: string[];
    explanation: string;
    question: string;
    risk: 'low' | 'moderate' | 'high' | 'neutral';
    action: string;
  }[] = [
    {
      category: 'data_collection',
      keywords: [
        'collect',
        'collected',
        'captures',
        'ingest',
        'personal information',
        'personal data',
        'device information',
        'location data',
        'cookies',
        'identifiers',
        'telemetry',
        'gps coordinate',
        'laboratory test results',
        'prescription scans',
        'session tokens',
        'fingerprints',
      ],
      exclusions: ['all rights reserved', 'physical security'],
      explanation: 'Specifies the types of personal identifiers, device telemetry, or usage data collected by the service.',
      question: 'What specific categories of device and location data are collected, and can I use the service with minimized collection?',
      risk: 'moderate',
      action: 'Review collected data fields and configure in-app device permissions.',
    },
    {
      category: 'purpose_specification',
      keywords: [
        'purpose',
        'how we use',
        'use your information',
        'processing',
        'legitimate use',
        'utilize user telemetry',
        'utilize your',
        'to process loan',
        'general platform enhancements',
        'commercial opportunities',
        'in order to provide',
        'used strictly for',
      ],
      exclusions: ['physical security guards', 'all rights reserved'],
      ambiguousTriggers: ['general platform enhancements', 'commercial opportunities', 'any purpose', 'as we see fit'],
      explanation: 'Details the business and operational purposes for which collected consumer information is processed.',
      question: 'Is my data used exclusively for service delivery, or also for algorithmic profiling and marketing?',
      risk: 'low',
      action: 'Verify if consent is tied to secondary advertising purposes.',
    },
    {
      category: 'third_party_sharing',
      keywords: [
        'third party',
        'third-party',
        'share your',
        'disclose',
        'logistics courier partners',
        'cloud data centers',
        'hosted in',
        'cross-border',
        'advertising networks',
        'affiliates',
        'service providers',
        'vendors',
        'trade your personal data',
        'monetary consideration',
      ],
      exclusions: ['physical security guards', 'all rights reserved'],
      explanation: 'Discloses third-party entities, advertising networks, or vendors with whom your information may be shared.',
      question: 'Which specific third-party partners receive my data, and do they process it outside India?',
      risk: 'high',
      action: 'Consider submitting an opt-out request for non-essential third-party sharing.',
    },
    {
      category: 'retention_period',
      keywords: [
        'retention',
        'how long we keep',
        'retain',
        'retained for',
        'mandatory period of',
        'statutory duration',
        'keep your listening logs',
        'storage duration',
        'deletion period',
        'until you delete',
        'as long as deemed necessary',
      ],
      exclusions: ['copyright', 'intellectual property', 'all rights reserved'],
      ambiguousTriggers: ['as long as deemed necessary', 'as long as we require', 'indefinitely'],
      explanation: 'Defines the timeframe or criteria used to determine how long consumer data is stored before deletion.',
      question: 'For how long is my personal information retained after I close or deactivate my account?',
      risk: 'moderate',
      action: 'Request prompt erasure upon completion of the transaction or purpose.',
    },
    {
      category: 'consent_and_choices',
      keywords: [
        'consent',
        'opt out',
        'opt-out',
        'withdraw consent',
        'withdraw your consent',
        'preferences',
        'choices',
        'disable behavioral tracking',
        'reset device advertising identifiers',
        'unsubscribe',
      ],
      exclusions: ['physical security guards'],
      explanation: 'Outlines the mechanisms available to give, adjust, or withdraw your consent.',
      question: 'How can I withdraw consent with the same ease as granting it, as mandated by DPDP Section 6(4)?',
      risk: 'moderate',
      action: 'Record your privacy preferences in the Preference Center.',
    },
    {
      category: 'consumer_rights',
      keywords: [
        'your rights',
        'right to access',
        'erasure',
        'correction',
        'rectification',
        'delete your account',
        'under the dpdp act',
        'right to obtain a summary',
        'data principal rights',
      ],
      exclusions: ['all rights reserved', 'intellectual property rights', 'copyright'],
      explanation: 'Describes your statutory rights to access, correct, or request the erasure of your personal data.',
      question: 'What is the turnaround time for processing a data erasure or access request?',
      risk: 'low',
      action: 'Utilize the Redressal Studio to draft a formal rights exercise letter.',
    },
    {
      category: 'security_practices',
      keywords: [
        'security',
        'safeguards',
        'encryption',
        'protect your data',
        'unauthorized access',
        'tls 1.3',
        'aes-256',
        'soc 2',
        'pci-dss',
      ],
      exclusions: ['physical security guards', 'gated access', 'office building'],
      explanation: 'Outlines organizational and technical security measures deployed to safeguard stored consumer data.',
      question: 'Are reasonable encryption standards applied both in transit and at rest for consumer data?',
      risk: 'low',
      action: 'Ensure strong personal account passwords and multi-factor authentication.',
    },
    {
      category: 'grievance_contact',
      keywords: [
        'grievance officer',
        'data protection officer',
        'dpo',
        'nodal privacy officer',
        'contact us',
        'privacy@',
        'nodal officer',
        'complaint',
        'grievance@',
      ],
      exclusions: ['all rights reserved'],
      explanation: 'Identifies the designated Grievance Officer / DPO and contact channels for resolving consumer privacy complaints.',
      question: 'What is the designated grievance redressal escalation mechanism if a request is not resolved within 30 days?',
      risk: 'low',
      action: 'Note the official DPO email address for any formal communications.',
    },
  ];

  // Split text into paragraphs / chunks
  const paragraphs = rawText
    .split(/\n\s*\n|\n(?=[A-Z0-9\.\-\s]{3,40}\n)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  let idCounter = 1;

  for (const rule of rules) {
    let matchedParagraph = '';
    let matchedSnippet = '';
    let isAmbiguousMatch = false;

    for (const p of paragraphs) {
      const pLower = p.toLowerCase();

      // Check exclusions first
      if (rule.exclusions && rule.exclusions.some((ex) => pLower.includes(ex.toLowerCase()))) {
        continue;
      }

      const matchedKeyword = rule.keywords.find((k) => pLower.includes(k.toLowerCase()));
      if (matchedKeyword) {
        matchedParagraph = p;
        const sentences = p.split(/(?<=[.?!])\s+/);
        const matchSentence = sentences.find((s) => s.toLowerCase().includes(matchedKeyword.toLowerCase())) || sentences[0] || p;
        matchedSnippet = matchSentence.trim().slice(0, 300);

        if (rule.ambiguousTriggers && rule.ambiguousTriggers.some((tr) => pLower.includes(tr.toLowerCase()))) {
          isAmbiguousMatch = true;
        }
        break;
      }
    }

    const clauseId = `clause-${idCounter++}`;
    const legalRef = getStatutoryReferenceForCategory(rule.category);

    if (matchedSnippet) {
      const verification = verifyEvidenceQuote(matchedSnippet, rawText);
      const infoState: InformationState = isAmbiguousMatch ? 'unclear' : 'stated';
      const uncertainty = computeUncertaintyLabel(infoState, verification.status);

      clauses.push({
        clause_id: clauseId,
        category: rule.category,
        category_label: CATEGORY_LABELS[rule.category],
        plain_language_explanation: rule.explanation,
        original_text: matchedParagraph.slice(0, 500),
        evidence_quote: matchedSnippet,
        matched_passage: verification.matchedText,
        source_offsets: verification.sourceOffsets,
        source_reference: `Extracted section (${rule.keywords[0]})`,
        evidence_status: verification.status,
        information_state: infoState,
        detection_source: 'deterministic_rule' as DetectionSource,
        uncertainty_label: uncertainty,
        potential_question: rule.question,
        legal_reference: legalRef,
        risk_level: isAmbiguousMatch ? 'moderate' : rule.risk,
        suggested_action: rule.action,
      });
    } else {
      // Mark as not found in analysed text
      const infoState: InformationState = 'not_found_in_analysed_text';
      const uncertainty = computeUncertaintyLabel(infoState, 'unverified');

      clauses.push({
        clause_id: clauseId,
        category: rule.category,
        category_label: CATEGORY_LABELS[rule.category],
        plain_language_explanation: `No explicit provisions regarding ${CATEGORY_LABELS[rule.category].toLowerCase()} were identified in the analysed document.`,
        evidence_quote: '',
        source_reference: 'Document scan',
        evidence_status: 'unverified',
        information_state: infoState,
        detection_source: 'deterministic_rule' as DetectionSource,
        uncertainty_label: uncertainty,
        potential_question: `Does the service maintain a separate schedule or policy detailing ${CATEGORY_LABELS[rule.category].toLowerCase()}?`,
        legal_reference: legalRef,
        risk_level: rule.category === 'grievance_contact' || rule.category === 'retention_period' ? 'high' : 'moderate',
        suggested_action: 'Seek clarification regarding missing policy disclosures.',
      });
    }
  }

  return clauses;
}

export async function analyzePolicyText(
  rawText: string,
  sourceLabel = 'Submitted Policy Document'
): Promise<PolicyAnalysisResult> {
  const analysisId = uuidv4();
  let clauses: AnalysedClause[] = [];

  const maxWindow = 30000;
  const isTruncated = rawText.length > maxWindow;
  const unanalysedCharsCount = isTruncated ? rawText.length - maxWindow : 0;
  const textToAnalyze = isTruncated ? rawText.slice(0, maxWindow) : rawText;
  let processingNotes = isTruncated
    ? `Analysis bounded to first ${maxWindow} characters (${unanalysedCharsCount} trailing characters unanalysed).`
    : 'Full document analyzed across all sections.';

  if (config.geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({
        model: config.geminiModel,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const prompt = `
${SYSTEM_PROMPT}

Analyze the following privacy policy document. Return a JSON array of extracted clause objects:
[
  {
    "category": "data_collection" | "purpose_specification" | "third_party_sharing" | "retention_period" | "consent_and_choices" | "consumer_rights" | "security_practices" | "grievance_contact" | "other",
    "plain_language_explanation": "string",
    "evidence_quote": "exact verbatim string from text",
    "source_reference": "Section or paragraph header",
    "information_state": "stated" | "unclear" | "not_found_in_analysed_text" | "requires_review",
    "potential_question": "string",
    "risk_level": "low" | "moderate" | "high" | "neutral",
    "suggested_action": "string"
  }
]

DOCUMENT TEXT:
"""
${textToAnalyze}
"""
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed: RawAIClause[] = JSON.parse(responseText);

      if (Array.isArray(parsed) && parsed.length > 0) {
        let counter = 1;
        clauses = parsed.map((item) => {
          const clauseId = `clause-${counter++}`;
          const verification = verifyEvidenceQuote(item.evidence_quote, rawText);
          const legalRef = getStatutoryReferenceForCategory(item.category);
          const infoState = item.information_state || 'stated';
          const uncertainty = computeUncertaintyLabel(infoState, verification.status);

          return {
            clause_id: clauseId,
            category: item.category,
            category_label: CATEGORY_LABELS[item.category] || 'General',
            plain_language_explanation: item.plain_language_explanation,
            evidence_quote: item.evidence_quote,
            matched_passage: verification.matchedText,
            source_offsets: verification.sourceOffsets,
            source_reference: item.source_reference || 'Analysed section',
            evidence_status: verification.status,
            information_state: infoState,
            detection_source: 'llm_extracted' as DetectionSource,
            uncertainty_label: uncertainty,
            potential_question: item.potential_question,
            legal_reference: legalRef,
            risk_level: item.risk_level || 'neutral',
            suggested_action: item.suggested_action,
          };
        });
      }
    } catch (err) {
      console.warn('Gemini API call failed or encountered parse error, falling back to deterministic parser:', err);
    }
  }

  // Fallback to deterministic rule-based analysis if AI clauses are empty
  if (clauses.length === 0) {
    clauses = analyzeWithRuleBasedParser(textToAnalyze, sourceLabel);
    if (!isTruncated) {
      processingNotes = 'Full document analyzed across all sections using deterministic rule & semantic fallback engine.';
    } else {
      processingNotes = `Analysis bounded to first ${maxWindow} characters (${unanalysedCharsCount} trailing characters unanalysed) using deterministic fallback engine.`;
    }
  }

  // Verification metrics calculation
  let verifiedCount = 0;
  for (const clause of clauses) {
    if (clause.evidence_quote) {
      const v = verifyEvidenceQuote(clause.evidence_quote, rawText);
      clause.evidence_status = v.status;
      clause.matched_passage = v.matchedText;
      clause.source_offsets = v.sourceOffsets;
      clause.uncertainty_label = computeUncertaintyLabel(clause.information_state, v.status);
      if (v.status === 'verified' || v.status === 'approximate') {
        verifiedCount++;
      }
    }
  }

  const verifiedClausesWithQuotes = clauses.filter((c) => c.evidence_quote.length > 0);
  const verificationRate =
    verifiedClausesWithQuotes.length > 0
      ? Math.round((verifiedCount / verifiedClausesWithQuotes.length) * 100)
      : 0;

  const categoriesPresent = Array.from(
    new Set(clauses.filter((c) => c.information_state === 'stated').map((c) => c.category))
  );

  const missingOrUnclear = Array.from(
    new Set(
      clauses
        .filter((c) => c.information_state === 'not_found_in_analysed_text' || c.information_state === 'unclear')
        .map((c) => c.category)
    )
  );

  return {
    analysis_id: analysisId,
    source_label: sourceLabel,
    created_at: new Date().toISOString(),
    character_count: rawText.length,
    raw_text_preview: rawText.slice(0, 1000) + (rawText.length > 1000 ? '...' : ''),
    is_truncated: isTruncated,
    unanalysed_chars_count: unanalysedCharsCount,
    processing_notes: processingNotes,
    summary: {
      total_clauses: clauses.length,
      categories_present: categoriesPresent,
      missing_or_unclear_categories: missingOrUnclear,
      evidence_verification_rate: verificationRate,
      primary_concerns_count: clauses.filter((c) => c.risk_level === 'high' || c.risk_level === 'moderate').length,
    },
    clauses,
    disclaimer: LEGAL_DISCLAIMER_TEXT,
  };
}
