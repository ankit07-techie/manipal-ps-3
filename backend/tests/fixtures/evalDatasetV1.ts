import { ClauseCategory, InformationState } from '../../src/types.js';

export interface LabeledClauseExample {
  example_id: string;
  source_document_id: string;
  sector: string;
  source_reference: string;
  example_type: 'positive_standard' | 'paraphrased' | 'ambiguous' | 'misleading_keyword' | 'negative_omission' | 'multi_sentence';
  input_text: string;
  expected_primary_category: ClauseCategory;
  expected_secondary_categories?: ClauseCategory[];
  expected_information_state: InformationState;
  expected_evidence_span?: string;
  annotation_notes: string;
}

export interface EvaluationDatasetMetadata {
  dataset_name: string;
  version: string;
  created_date: string;
  license: string;
  total_examples: number;
  categories_distribution: Record<ClauseCategory, number>;
  example_types_distribution: Record<string, number>;
}

export const EVALUATION_DATASET_V1: LabeledClauseExample[] = [
  // 1. DATA COLLECTION - Positive & Paraphrased
  {
    example_id: 'EX-DC-01',
    source_document_id: 'DOC-ECOM-01',
    sector: 'e_commerce',
    source_reference: 'Section 1.1 (Collected Attributes)',
    example_type: 'positive_standard',
    input_text: 'We collect your full legal name, telephone number, email address, physical delivery address, and bank payment card token.',
    expected_primary_category: 'data_collection',
    expected_information_state: 'stated',
    expected_evidence_span: 'We collect your full legal name, telephone number',
    annotation_notes: 'Standard direct statement of direct personal identifiers and financial data.',
  },
  {
    example_id: 'EX-DC-02',
    source_document_id: 'DOC-MOB-02',
    sector: 'mobility',
    source_reference: 'Section 2 (Sensor Diagnostics)',
    example_type: 'paraphrased',
    input_text: 'Our smartphone software captures continuous GPS coordinate streams, accelerometer telemetry, and cellular tower network fingerprints while on trip.',
    expected_primary_category: 'data_collection',
    expected_information_state: 'stated',
    expected_evidence_span: 'Our smartphone software captures continuous GPS coordinate streams',
    annotation_notes: 'Paraphrased telemetry and sensor data without using the word "collect".',
  },
  {
    example_id: 'EX-DC-03',
    source_document_id: 'DOC-HEALTH-03',
    sector: 'healthtech',
    source_reference: 'Section 1 (Diagnostic Records)',
    example_type: 'positive_standard',
    input_text: 'We ingest diagnostic laboratory test results, prescription scans, and doctor consultation transcripts uploaded by patients.',
    expected_primary_category: 'data_collection',
    expected_information_state: 'stated',
    expected_evidence_span: 'We ingest diagnostic laboratory test results',
    annotation_notes: 'Sensitive personal health information category.',
  },

  // 2. PURPOSE SPECIFICATION - Positive & Ambiguous
  {
    example_id: 'EX-PS-04',
    source_document_id: 'DOC-FIN-04',
    sector: 'fintech',
    source_reference: 'Section 3.2 (Grounds for Processing)',
    example_type: 'positive_standard',
    input_text: 'We utilize user telemetry exclusively to process loan applications, compute credit risk scores, and prevent fraudulent transactions.',
    expected_primary_category: 'purpose_specification',
    expected_information_state: 'stated',
    expected_evidence_span: 'We utilize user telemetry exclusively to process loan applications',
    annotation_notes: 'Clear statement of lawful processing purposes under DPDP Section 4(1).',
  },
  {
    example_id: 'EX-PS-05',
    source_document_id: 'DOC-SOC-05',
    sector: 'social_media',
    source_reference: 'Section 4 (General Optimization)',
    example_type: 'ambiguous',
    input_text: 'We may analyze your browsing patterns and interactions for general platform enhancements and any relevant commercial opportunities.',
    expected_primary_category: 'purpose_specification',
    expected_information_state: 'unclear',
    expected_evidence_span: 'We may analyze your browsing patterns and interactions',
    annotation_notes: 'Vague, non-specific secondary purpose description requiring human review.',
  },

  // 3. THIRD-PARTY SHARING - Positive, Negative Keyword & Misleading
  {
    example_id: 'EX-TPS-06',
    source_document_id: 'DOC-ECOM-06',
    sector: 'e_commerce',
    source_reference: 'Section 4.1 (External Disclosures)',
    example_type: 'positive_standard',
    input_text: 'We disclose customer delivery addresses to licensed logistics courier partners and share device identifiers with programmatic advertising networks.',
    expected_primary_category: 'third_party_sharing',
    expected_information_state: 'stated',
    expected_evidence_span: 'We disclose customer delivery addresses to licensed logistics courier partners',
    annotation_notes: 'Clear multi-entity third-party disclosure statement.',
  },
  {
    example_id: 'EX-TPS-07',
    source_document_id: 'DOC-BANK-07',
    sector: 'banking',
    source_reference: 'Section 5 (No Third-Party Sale Policy)',
    example_type: 'misleading_keyword',
    input_text: 'We do not sell, rent, or trade your personal data with third-party marketing brokers for monetary consideration.',
    expected_primary_category: 'third_party_sharing',
    expected_information_state: 'stated',
    expected_evidence_span: 'We do not sell, rent, or trade your personal data with third-party marketing brokers',
    annotation_notes: 'Negative constraint statement regarding third-party sharing.',
  },
  {
    example_id: 'EX-TPS-08',
    source_document_id: 'DOC-SAAS-08',
    sector: 'enterprise_saas',
    source_reference: 'Section 8 (Cross-Border Transfer)',
    example_type: 'paraphrased',
    input_text: 'Customer records are hosted in cloud data centers located in Singapore and Germany subject to standard contractual clauses.',
    expected_primary_category: 'third_party_sharing',
    expected_information_state: 'stated',
    expected_evidence_span: 'Customer records are hosted in cloud data centers located in Singapore',
    annotation_notes: 'Cross-border data transfer disclosure without "third party" keyword.',
  },

  // 4. RETENTION PERIOD - Definite, Indefinite & Misleading
  {
    example_id: 'EX-RET-09',
    source_document_id: 'DOC-TAX-09',
    sector: 'fintech',
    source_reference: 'Section 6 (Storage Durations)',
    example_type: 'positive_standard',
    input_text: 'Accounting ledger entries and invoice records are retained for a statutory duration of 7 years in accordance with Indian tax statutes.',
    expected_primary_category: 'retention_period',
    expected_information_state: 'stated',
    expected_evidence_span: 'retained for a statutory duration of 7 years',
    annotation_notes: 'Specific statutory time-bound retention period.',
  },
  {
    example_id: 'EX-RET-10',
    source_document_id: 'DOC-STREAM-10',
    sector: 'streaming',
    source_reference: 'Section 7 (Account Retention)',
    example_type: 'ambiguous',
    input_text: 'We keep your listening logs for as long as deemed necessary to provide music services or until you delete your account.',
    expected_primary_category: 'retention_period',
    expected_information_state: 'unclear',
    expected_evidence_span: 'We keep your listening logs for as long as deemed necessary',
    annotation_notes: 'Indefinite, subjective retention period phrasing.',
  },
  {
    example_id: 'EX-RET-11',
    source_document_id: 'DOC-LEGAL-11',
    sector: 'legal_publishing',
    source_reference: 'Section 12 (Copyright & IP)',
    example_type: 'misleading_keyword',
    input_text: 'All copyright, trademarks, and intellectual property rights in published articles are retained exclusively by the original authors.',
    expected_primary_category: 'other',
    expected_information_state: 'stated',
    expected_evidence_span: 'intellectual property rights in published articles are retained',
    annotation_notes: 'Misleading keyword "retained" referring to intellectual property rather than data retention.',
  },

  // 5. CONSENT & CHOICES - Positive & Withdrawal
  {
    example_id: 'EX-CON-12',
    source_document_id: 'DOC-EDTECH-12',
    sector: 'edtech',
    source_reference: 'Section 3 (Consent & Opt-Out)',
    example_type: 'positive_standard',
    input_text: 'You may withdraw consent for personalized course recommendations and marketing newsletters at any time via your account profile settings.',
    expected_primary_category: 'consent_and_choices',
    expected_information_state: 'stated',
    expected_evidence_span: 'You may withdraw consent for personalized course recommendations',
    annotation_notes: 'Explicit consent withdrawal mechanism under DPDP Act Sec 6(4).',
  },
  {
    example_id: 'EX-CON-13',
    source_document_id: 'DOC-AD-13',
    sector: 'advertising',
    source_reference: 'Section 2 (Cookie Tracking Choices)',
    example_type: 'paraphrased',
    input_text: 'Users can disable behavioral tracking beacons and reset device advertising identifiers directly in their browser preferences.',
    expected_primary_category: 'consent_and_choices',
    expected_information_state: 'stated',
    expected_evidence_span: 'Users can disable behavioral tracking beacons',
    annotation_notes: 'User opt-out choices expressed without the word "consent".',
  },

  // 6. CONSUMER RIGHTS - Access, Erasure, Correction
  {
    example_id: 'EX-RT-14',
    source_document_id: 'DOC-RETAIL-14',
    sector: 'e_commerce',
    source_reference: 'Section 9 (Data Principal Rights)',
    example_type: 'positive_standard',
    input_text: 'Under the DPDP Act 2023, you have the right to obtain a summary of your personal data, request correction of inaccurate records, and demand complete erasure.',
    expected_primary_category: 'consumer_rights',
    expected_information_state: 'stated',
    expected_evidence_span: 'Under the DPDP Act 2023, you have the right to obtain a summary',
    annotation_notes: 'Direct enumeration of DPDP Act Section 11 & Section 12 rights.',
  },
  {
    example_id: 'EX-RT-15',
    source_document_id: 'DOC-CORP-15',
    sector: 'corporate_web',
    source_reference: 'Footer Clause (Site Terms)',
    example_type: 'misleading_keyword',
    input_text: 'All rights reserved. Unauthorized reproduction or redistribution of website text is strictly prohibited by law.',
    expected_primary_category: 'other',
    expected_information_state: 'stated',
    expected_evidence_span: 'All rights reserved. Unauthorized reproduction',
    annotation_notes: 'Misleading keyword "rights" referring to copyright reservation, not consumer data rights.',
  },

  // 7. SECURITY PRACTICES - Positive, Technical & Misleading
  {
    example_id: 'EX-SEC-16',
    source_document_id: 'DOC-PAY-16',
    sector: 'fintech',
    source_reference: 'Section 5 (Technical Safeguards)',
    example_type: 'positive_standard',
    input_text: 'We implement TLS 1.3 encryption in transit, AES-256 encryption at rest, and maintain annual SOC 2 Type II audit certifications.',
    expected_primary_category: 'security_practices',
    expected_information_state: 'stated',
    expected_evidence_span: 'We implement TLS 1.3 encryption in transit',
    annotation_notes: 'Specific technical and organizational security measures under DPDP Sec 8(5).',
  },
  {
    example_id: 'EX-SEC-17',
    source_document_id: 'DOC-REALTY-17',
    sector: 'real_estate',
    source_reference: 'Section 1 (Office Facility)',
    example_type: 'misleading_keyword',
    input_text: 'Our corporate office building provides 24/7 physical security guards and gated access for visiting clients.',
    expected_primary_category: 'other',
    expected_information_state: 'stated',
    expected_evidence_span: 'physical security guards and gated access',
    annotation_notes: 'Misleading keyword "security" referring to physical facility security, not digital data security.',
  },

  // 8. GRIEVANCE CONTACT - Positive, Escalation & Missing
  {
    example_id: 'EX-GRV-18',
    source_document_id: 'DOC-ECOMM-18',
    sector: 'e_commerce',
    source_reference: 'Section 10 (Grievance Redressal)',
    example_type: 'positive_standard',
    input_text: 'Designated Grievance Officer: Ananya Sen, Email: nodal-grievance@company.in, Address: Cyber City, Gurugram, Haryana. Statutory response timeline: 30 days.',
    expected_primary_category: 'grievance_contact',
    expected_information_state: 'stated',
    expected_evidence_span: 'Designated Grievance Officer: Ananya Sen, Email: nodal-grievance@company.in',
    annotation_notes: 'Complete statutory Grievance Officer disclosure with name, email, and address.',
  },
  {
    example_id: 'EX-GRV-19',
    source_document_id: 'DOC-APP-19',
    sector: 'mobile_app',
    source_reference: 'Section 11 (Contact Us)',
    example_type: 'paraphrased',
    input_text: 'For unresolved consumer privacy disputes or escalation under DPDP Rules, contact our Nodal Privacy Officer at dpo@mobileapp.co.',
    expected_primary_category: 'grievance_contact',
    expected_information_state: 'stated',
    expected_evidence_span: 'contact our Nodal Privacy Officer at dpo@mobileapp.co',
    annotation_notes: 'Escalation channel identified using DPO terminology.',
  },

  // 9. NEGATIVE OMISSIONS - Absent Categories
  {
    example_id: 'EX-OM-20',
    source_document_id: 'DOC-MINI-20',
    sector: 'newsletter',
    source_reference: 'Document Full Scan',
    example_type: 'negative_omission',
    input_text: 'We collect your email address to send monthly blog newsletters. Unsubscribe anytime via the link in the email.',
    expected_primary_category: 'retention_period',
    expected_information_state: 'not_found_in_analysed_text',
    annotation_notes: 'Document omits retention periods entirely; must be classified as not_found_in_analysed_text.',
  },
  {
    example_id: 'EX-OM-21',
    source_document_id: 'DOC-MINI-20',
    sector: 'newsletter',
    source_reference: 'Document Full Scan',
    example_type: 'negative_omission',
    input_text: 'We collect your email address to send monthly blog newsletters. Unsubscribe anytime via the link in the email.',
    expected_primary_category: 'grievance_contact',
    expected_information_state: 'not_found_in_analysed_text',
    annotation_notes: 'Document omits Grievance Officer details; must be classified as not_found_in_analysed_text.',
  },
  {
    example_id: 'EX-OM-22',
    source_document_id: 'DOC-MINI-20',
    sector: 'newsletter',
    source_reference: 'Document Full Scan',
    example_type: 'negative_omission',
    input_text: 'We collect your email address to send monthly blog newsletters. Unsubscribe anytime via the link in the email.',
    expected_primary_category: 'security_practices',
    expected_information_state: 'not_found_in_analysed_text',
    annotation_notes: 'Document omits technical security measures; must be classified as not_found_in_analysed_text.',
  },

  // 10. MULTI-SENTENCE & EDGE CASES
  {
    example_id: 'EX-MS-23',
    source_document_id: 'DOC-FIN-23',
    sector: 'fintech',
    source_reference: 'Section 4 (Regulatory Compliance & Retention)',
    example_type: 'multi_sentence',
    input_text: 'Under Reserve Bank of India Master Directions, transaction records and KYC dossiers must be retained for a mandatory period of 10 years following account closure.',
    expected_primary_category: 'retention_period',
    expected_secondary_categories: ['purpose_specification'],
    expected_information_state: 'stated',
    expected_evidence_span: 'mandatory period of 10 years following account closure',
    annotation_notes: 'Dual-category clause intersecting regulatory purpose and retention duration.',
  },
  {
    example_id: 'EX-MS-24',
    source_document_id: 'DOC-ECOM-24',
    sector: 'e_commerce',
    source_reference: 'Section 2 (Cookie Tracking Notice)',
    example_type: 'positive_standard',
    input_text: 'We store session tokens, shopping cart cookies, and authentication state on your local web browser.',
    expected_primary_category: 'data_collection',
    expected_information_state: 'stated',
    expected_evidence_span: 'We store session tokens, shopping cart cookies',
    annotation_notes: 'Local storage and cookie telemetry collection.',
  }
];

export const DATASET_METADATA: EvaluationDatasetMetadata = {
  dataset_name: 'NyayaNet DPDP Policy Evaluation Benchmark Dataset',
  version: '1.0.0',
  created_date: '2026-10-09',
  license: 'Open Synthetic / Public Reference',
  total_examples: EVALUATION_DATASET_V1.length,
  categories_distribution: {
    data_collection: 4,
    purpose_specification: 2,
    third_party_sharing: 3,
    retention_period: 4,
    consent_and_choices: 2,
    consumer_rights: 2,
    security_practices: 2,
    grievance_contact: 3,
    other: 2,
  },
  example_types_distribution: {
    positive_standard: 8,
    paraphrased: 4,
    ambiguous: 2,
    misleading_keyword: 4,
    negative_omission: 3,
    multi_sentence: 3,
  },
};
