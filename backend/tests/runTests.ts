import assert from 'node:assert';
import { extractTextFromBuffer } from '../src/services/pdfExtractor.js';
import { verifyEvidenceQuote } from '../src/services/evidenceMatcher.js';
import { analyzePolicyText } from '../src/services/aiAnalyzer.js';
import { generateRedressalDraft } from '../src/services/draftGenerator.js';
import { storage } from '../src/storage/storageAdapter.js';

const SAMPLE_POLICY_TEXT = `
SAMPLE E-COMMERCE PRIVACY NOTICE (INDIA)
Last updated: January 2025

1. INFORMATION WE COLLECT
We collect personal information that you provide to us, including your full name, email address, phone number, delivery address, and payment transaction tokens. We also automatically collect device telemetry such as IP address, operating system, and precise location data when you use our mobile application.

2. HOW WE USE YOUR INFORMATION
We use your information strictly for order fulfillment, fraud detection, customer support, and to communicate order updates. With your explicit consent, we may use your browsing history to show personalized recommendations.

3. THIRD-PARTY SHARING AND DISCLOSURES
We may share your delivery address with logistics partners. We do not sell your personal data. We may share anonymized analytical data with advertising partners for performance measurement.

4. DATA RETENTION
We retain your personal data only for as long as necessary to fulfill the purposes outlined in this notice or as required by applicable tax and commercial laws in India.

5. YOUR RIGHTS AND CHOICES
Under the Digital Personal Data Protection Act, 2023, you have the right to access, correct, or request the erasure of your personal data. You may withdraw consent at any time via your account settings.

6. GRIEVANCE OFFICER DETAILS
If you have questions or complaints regarding our data processing, please contact our Grievance Officer:
Name: Priya Sharma, Nodal Grievance Officer
Email: privacy-grievance@sample-store.in
Address: Cyber City, Gurugram, Haryana, India
`;

async function runTestSuite() {
  console.log('--- RUNNING PRIVACYLENS STRENGTHENED TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Test Text Extractor
  await test('Document Extractor handles text buffers correctly', async () => {
    const buffer = Buffer.from(SAMPLE_POLICY_TEXT, 'utf-8');
    const extracted = await extractTextFromBuffer(buffer, 'text/plain');
    assert.strictEqual(typeof extracted.rawText, 'string');
    assert(extracted.characterCount > 500, 'Expected character count > 500');
    assert(extracted.wordCount > 50, 'Expected word count > 50');
  });

  // 2. Exact Match Verification
  await test('Evidence Matcher verifies verbatim exact quotes with accurate offsets', () => {
    const quote = 'We collect personal information that you provide to us';
    const result = verifyEvidenceQuote(quote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'verified');
    assert.strictEqual(result.matchScore, 1.0);
    assert(result.sourceOffsets, 'Expected source offsets');
    assert.strictEqual(SAMPLE_POLICY_TEXT.substring(result.sourceOffsets!.start_char, result.sourceOffsets!.end_char), quote);
  });

  // 3. Normalized Contiguous Passage Match
  await test('Evidence Matcher verifies contiguous passage across whitespace/line-break variations', () => {
    const quote = 'We    collect\n\npersonal    information   that   you   provide to us';
    const result = verifyEvidenceQuote(quote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'approximate');
    assert.strictEqual(result.matchScore, 0.90);
    assert(result.sourceOffsets, 'Expected source offsets');
    assert(result.matchedText?.includes('personal information'));
  });

  // 4. Strict Rejection: Reordered Tokens
  await test('Evidence Matcher strictly rejects reordered tokens (anagrams/scrambled words)', () => {
    const scrambledQuote = 'personal collect information that us to provide you We';
    const result = verifyEvidenceQuote(scrambledQuote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'unverified');
    assert.strictEqual(result.matchScore, 0.0);
    assert.strictEqual(result.sourceOffsets, undefined);
  });

  // 5. Strict Rejection: Spliced Non-Contiguous Fragments
  await test('Evidence Matcher strictly rejects spliced non-contiguous fragments', () => {
    // Splicing Section 1 prefix with Section 6 suffix
    const splicedQuote = 'We collect personal information Cyber City Gurugram Haryana India';
    const result = verifyEvidenceQuote(splicedQuote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'unverified');
    assert.strictEqual(result.matchScore, 0.0);
  });

  // 6. Strict Rejection: Fabricated Quotes
  await test('Evidence Matcher strictly rejects fabricated / hallucinated quotes', () => {
    const fakeQuote = 'We sell your biometric DNA telemetry to offshore crypto hedge funds';
    const result = verifyEvidenceQuote(fakeQuote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'unverified');
    assert.strictEqual(result.matchScore, 0.0);
  });

  // 7. Strict Rejection: Empty / Malformed Input
  await test('Evidence Matcher rejects empty or punctuation-only strings', () => {
    assert.strictEqual(verifyEvidenceQuote('', SAMPLE_POLICY_TEXT).status, 'unverified');
    assert.strictEqual(verifyEvidenceQuote('   ', SAMPLE_POLICY_TEXT).status, 'unverified');
    assert.strictEqual(verifyEvidenceQuote('... --- !!!', SAMPLE_POLICY_TEXT).status, 'unverified');
  });

  // 8. Policy Analyzer: Category Segmentation, Offsets & Provenance
  await test('Policy Analyzer attaches detection_source and uncertainty_label', async () => {
    const analysis = await analyzePolicyText(SAMPLE_POLICY_TEXT, 'Test Policy');
    assert(analysis.analysis_id, 'Expected analysis_id');
    assert(analysis.clauses.length >= 6, 'Expected at least 6 extracted clauses');

    const collectionClause = analysis.clauses.find((c) => c.category === 'data_collection');
    assert(collectionClause, 'Expected data_collection clause');
    assert.strictEqual(collectionClause?.evidence_status, 'verified');
    assert.strictEqual(collectionClause?.detection_source, 'deterministic_rule');
    assert.strictEqual(collectionClause?.uncertainty_label, 'high_certainty');
    assert(collectionClause?.source_offsets, 'Expected source offsets on verified clause');
    assert(collectionClause?.legal_reference?.statute.includes('DPDP'));
  });

  // 9. Policy Analyzer: Omission & Absence Semantics
  await test('Policy Analyzer flags omitted categories as not_found_in_analysed_text with unverified_omission', async () => {
    const minimalText = 'We collect your name and email. Contact us at support@example.com';
    const analysis = await analyzePolicyText(minimalText, 'Minimal Policy');
    const retentionClause = analysis.clauses.find((c) => c.category === 'retention_period');
    assert(retentionClause, 'Expected retention clause check');
    assert.strictEqual(retentionClause?.information_state, 'not_found_in_analysed_text');
    assert.strictEqual(retentionClause?.evidence_status, 'unverified');
    assert.strictEqual(retentionClause?.uncertainty_label, 'unverified_omission');
  });

  // 10. Redressal Draft: DPDP Section 6(4) Consent Withdrawal
  await test('Draft Generator creates DPDP Section 6(4) consent withdrawal letter', () => {
    const draft = generateRedressalDraft({
      concern_type: 'consent_withdrawal',
      service_name: 'Acme Retail',
      recipient_email: 'dpo@acme.com',
      consumer_name: 'Rahul Sharma',
      consumer_identifier: 'rahul@example.com',
      user_notes: 'Please cease marketing SMS and profiling.',
    });

    assert(draft.draft_id, 'Expected draft_id');
    assert(draft.subject.includes('Section 6(4) of DPDP Act 2023'));
    assert(draft.body.includes('Rahul Sharma'));
    assert(draft.statutory_citations.some((c) => c.section === 'Section 6(4)'));
  });

  // 11. Redressal Draft: DPDP Section 12 Data Erasure
  await test('Draft Generator creates DPDP Section 12 data erasure letter', () => {
    const draft = generateRedressalDraft({
      concern_type: 'data_erasure',
      service_name: 'FinTech App',
      consumer_name: 'Anita Verma',
      consumer_identifier: 'anita@example.com',
    });

    assert(draft.subject.includes('Section 12'));
    assert(draft.statutory_citations.some((c) => c.section === 'Section 12'));
  });

  // 12. Storage Adapter: Preferences Status Honesty
  await test('Storage Adapter manages preferences with honest local status', async () => {
    const prefs = await storage.listPreferences();
    assert(prefs.length >= 3, 'Expected default preferences');

    const first = prefs[0];
    assert.strictEqual(first.status, 'local_record');
    assert(first.status_explanation.includes('Locally recorded'));

    const updated = await storage.updatePreference(first.id, {
      current_value: true,
      status: 'pending_manual_send',
      status_explanation: 'Opt-out request queued for consumer dispatch.',
    });

    assert.strictEqual(updated.current_value, true);
    assert.strictEqual(updated.status, 'pending_manual_send');
  });

  // 13. Storage Adapter: Append-Only Request Event Timeline
  await test('Storage Adapter maintains append-only timeline events without mutation', async () => {
    const req = await storage.createRequest({
      service_name: 'Test Platform',
      recipient_email: 'grievance@test.com',
      concern_type: 'grievance_inquiry',
      status: 'draft',
      subject: 'Inquiry regarding third-party disclosures',
      body_content: 'Please provide notice details.',
    });

    assert(req.id.startsWith('req-'));
    assert.strictEqual(req.events.length, 1);
    assert.strictEqual(req.events[0].event_type, 'created');

    const updated = await storage.addRequestEvent(req.id, {
      event_type: 'marked_as_sent',
      description: 'Dispatched manually via email by consumer',
      statusChange: 'sent_manually',
    });

    assert.strictEqual(updated.events.length, 2);
    assert.strictEqual(updated.status, 'sent_manually');
  });

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
