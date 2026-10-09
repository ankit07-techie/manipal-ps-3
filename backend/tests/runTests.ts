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
  console.log('--- RUNNING PRIVACYLENS BACKEND AUTOMATED TEST SUITE ---');
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
  await test('Document Extractor handles text buffers', async () => {
    const buffer = Buffer.from(SAMPLE_POLICY_TEXT, 'utf-8');
    const extracted = await extractTextFromBuffer(buffer, 'text/plain');
    assert.strictEqual(typeof extracted.rawText, 'string');
    assert(extracted.characterCount > 500, 'Expected character count > 500');
    assert(extracted.wordCount > 50, 'Expected word count > 50');
  });

  // 2. Test Evidence Matcher - Verbatim Quote
  await test('Evidence Matcher verifies verbatim exact quotes', () => {
    const quote = 'We collect personal information that you provide to us';
    const result = verifyEvidenceQuote(quote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'verified');
    assert(result.matchScore >= 0.95);
  });

  // 3. Test Evidence Matcher - Normalized Quote (different spacing/newlines)
  await test('Evidence Matcher handles normalized whitespace differences', () => {
    const quote = 'We   collect   personal   information that you provide to us';
    const result = verifyEvidenceQuote(quote, SAMPLE_POLICY_TEXT);
    assert(result.status === 'verified' || result.status === 'approximate');
    assert(result.matchScore >= 0.80);
  });

  // 4. Test Evidence Matcher - Hallucinated / Non-existent Quote
  await test('Evidence Matcher rejects fabricated quotes as unverified', () => {
    const fakeQuote = 'We sell your biometric DNA data to overseas brokers for crypto profits';
    const result = verifyEvidenceQuote(fakeQuote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'unverified');
    assert.strictEqual(result.matchScore, 0.0);
  });

  // 5. Test Policy Analysis Pipeline
  await test('Policy Analyzer segments categories & verifies quotes', async () => {
    const analysis = await analyzePolicyText(SAMPLE_POLICY_TEXT, 'Test Policy');
    assert(analysis.analysis_id, 'Expected analysis_id');
    assert(analysis.clauses.length >= 6, 'Expected at least 6 extracted clauses');

    const collectionClause = analysis.clauses.find((c) => c.category === 'data_collection');
    assert(collectionClause, 'Expected data_collection clause');
    assert.strictEqual(collectionClause?.evidence_status, 'verified');
    assert(collectionClause?.legal_reference, 'Expected legal_reference to exist on data_collection clause');
    assert(collectionClause?.legal_reference?.statute.includes('DPDP'), 'Expected DPDP in statute title');

    const grievanceClause = analysis.clauses.find((c) => c.category === 'grievance_contact');
    assert(grievanceClause, 'Expected grievance_contact clause');
    assert.strictEqual(grievanceClause?.evidence_status, 'verified');

    assert(analysis.summary.evidence_verification_rate > 80, 'Expected high evidence verification rate');
  });

  // 6. Test Policy Missing Category Detection
  await test('Policy Analyzer flags omitted categories as not_found_in_analysed_text', async () => {
    const minimalText = 'We collect your name and email to send you notifications. Contact us at hello@example.com';
    const analysis = await analyzePolicyText(minimalText, 'Minimal Policy');
    const retentionClause = analysis.clauses.find((c) => c.category === 'retention_period');
    assert(retentionClause, 'Expected retention clause to be checked');
    assert.strictEqual(retentionClause?.information_state, 'not_found_in_analysed_text');
    assert.strictEqual(retentionClause?.evidence_status, 'unverified');
  });

  // 7. Test Redressal Draft Generator (Consent Withdrawal)
  await test('Draft Generator creates DPDP Section 6(4) consent withdrawal letter', () => {
    const draft = generateRedressalDraft({
      concern_type: 'consent_withdrawal',
      service_name: 'Acme Retail',
      recipient_email: 'dpo@acme.com',
      consumer_name: 'Rahul Sharma',
      consumer_identifier: 'rahul@example.com',
      user_notes: 'Please stop marketing SMS and personalized tracking.',
    });

    assert(draft.draft_id, 'Expected draft_id');
    assert(draft.subject.includes('Section 6(4) of DPDP Act 2023'));
    assert(draft.body.includes('Rahul Sharma'));
    assert(draft.body.includes('dpo@acme.com'));
    assert(draft.statutory_citations.some((c) => c.section === 'Section 6(4)'));
  });

  // 8. Test Redressal Draft Generator (Erasure Request)
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

  // 9. Test Preference Records Storage & Status Honesty
  await test('Storage Adapter manages preferences and honest status values', async () => {
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

  // 10. Test Request Tracking & Event Timeline
  await test('Storage Adapter manages request lifecycle and append-only event timeline', async () => {
    const req = await storage.createRequest({
      service_name: 'Test Platform',
      recipient_email: 'grievance@test.com',
      concern_type: 'grievance_inquiry',
      status: 'draft',
      subject: 'Inquiry regarding data sharing',
      body_content: 'Please explain location data sharing.',
    });

    assert(req.id.startsWith('req-'));
    assert.strictEqual(req.events.length, 1);
    assert.strictEqual(req.events[0].event_type, 'created');

    const updated = await storage.addRequestEvent(req.id, {
      event_type: 'marked_as_sent',
      description: 'Email sent manually by consumer to grievance officer',
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
