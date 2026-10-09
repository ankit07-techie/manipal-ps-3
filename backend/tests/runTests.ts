import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { extractTextFromBuffer } from '../src/services/pdfExtractor.js';
import { verifyEvidenceQuote } from '../src/services/evidenceMatcher.js';
import { analyzePolicyText } from '../src/services/aiAnalyzer.js';
import { generateRedressalDraft } from '../src/services/draftGenerator.js';
import { storage, StorageAdapter } from '../src/storage/storageAdapter.js';
import { createSyntheticDocx } from './fixtures/syntheticDocx.js';
import { OFFICIAL_LEGAL_URLS, DPDP_ACT_2023_SOURCES, getStatutoryReferenceForCategory } from '../src/data/legalSources.js';
import { securityHeaders, createRateLimiter } from '../src/middleware/security.js';

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
  console.log('--- RUNNING PRIVACYLENS COMPLETE TEST SUITE (PHASE 2 DOCX INGESTION) ---');
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

  // 1. Plain Text Extractor (Backward Compatibility)
  await test('Document Extractor handles plain-text buffers correctly (backward compatible)', async () => {
    const buffer = Buffer.from(SAMPLE_POLICY_TEXT, 'utf-8');
    const extracted = await extractTextFromBuffer(buffer, 'text/plain', 'policy.txt');
    assert.strictEqual(extracted.format, 'text');
    assert(extracted.characterCount > 500, 'Expected character count > 500');
    assert(extracted.wordCount > 50, 'Expected word count > 50');
    assert(extracted.rawText.includes('Priya Sharma'));
    assert(extracted.rawText.includes('Grievance Officer'));
  });

  // 2. Synthetic Valid DOCX Extraction (Paragraphs)
  await test('Document Extractor parses genuine synthetic .docx paragraphs', async () => {
    const docxBuffer = await createSyntheticDocx({
      paragraphs: [
        'PRIVACY POLICY FOR SYNTHETIC APPLICATION (INDIA)',
        '1. DATA COLLECTION: We collect your full name, primary email address, and mobile phone number for authentication.',
        '2. DATA RETENTION: We store consumer logs for 365 days before automatic erasure in accordance with the DPDP Act 2023.',
        '3. GRIEVANCE REDRESSAL: Contact our Grievance Officer at grievance@synthetic-app.in.',
      ],
    });

    const extracted = await extractTextFromBuffer(
      docxBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'notice.docx'
    );

    assert.strictEqual(extracted.format, 'docx');
    assert(extracted.characterCount > 150, 'Expected character count > 150');
    assert(extracted.rawText.includes('DATA COLLECTION: We collect your full name'));
    assert(extracted.rawText.includes('grievance@synthetic-app.in'));
  });

  // 3. Synthetic Valid DOCX Extraction (Tables with Predictable Reading Order)
  await test('Document Extractor preserves table rows and cells in predictable reading order', async () => {
    const docxBuffer = await createSyntheticDocx({
      paragraphs: ['DATA RETENTION SCHEDULE MATRIX'],
      tables: [
        [
          ['Data Category', 'Retention Purpose', 'Statutory Retention Duration'],
          ['Transaction Financials', 'Tax Compliance', '7 Years'],
          ['Session Telemetry', 'Fraud Prevention', '90 Days'],
        ],
      ],
    });

    const extracted = await extractTextFromBuffer(
      docxBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'schedule.docx'
    );

    assert.strictEqual(extracted.format, 'docx');
    assert(extracted.rawText.includes('Data Category'));
    assert(extracted.rawText.includes('Transaction Financials'));
    assert(extracted.rawText.includes('7 Years'));
    assert(extracted.rawText.includes('90 Days'));
  });

  // 4. Synthetic Empty DOCX Rejection
  await test('Document Extractor rejects empty DOCX document with descriptive error', async () => {
    const emptyDocx = await createSyntheticDocx({ empty: true });
    await assert.rejects(
      async () => {
        await extractTextFromBuffer(
          emptyDocx,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'empty.docx'
        );
      },
      /Extracted DOCX document is empty or contains no readable text content/
    );
  });

  // 5. Corrupted / Malformed DOCX Archive Rejection
  await test('Document Extractor rejects malformed DOCX archive with descriptive error', async () => {
    // Starts with PK zip magic bytes but contains truncated / corrupt zip stream
    const corruptDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00]);
    await assert.rejects(
      async () => {
        await extractTextFromBuffer(
          corruptDocx,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'corrupted.docx'
        );
      },
      /Failed to extract text from DOCX archive/
    );
  });

  // 6. Legacy Binary .doc Format Rejection
  await test('Document Extractor rejects legacy binary Word (.doc) format with conversion guidance', async () => {
    const legacyDocBuffer = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00, 0x00, 0x00]);
    await assert.rejects(
      async () => {
        await extractTextFromBuffer(legacyDocBuffer, 'application/msword', 'legacy.doc');
      },
      /Legacy binary Word \(\.doc\) format is not supported/
    );
  });

  // 7. Empty Buffer Rejection
  await test('Document Extractor rejects empty buffer with descriptive error', async () => {
    await assert.rejects(
      async () => {
        await extractTextFromBuffer(Buffer.alloc(0));
      },
      /Submitted document buffer is empty/
    );
  });

  // 8. Short Document Rejection (<20 chars)
  await test('Document Extractor rejects excessively short document (<20 chars)', async () => {
    await assert.rejects(
      async () => {
        await extractTextFromBuffer(Buffer.from('Short', 'utf-8'));
      },
      /empty or too short/
    );
  });

  // 9. Unsupported Binary Rejection
  await test('Document Extractor rejects unsupported random binary data', async () => {
    const randomBinary = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x0e, 0x0f, 0x10, 0x11, 0x12]);
    await assert.rejects(
      async () => {
        await extractTextFromBuffer(randomBinary, 'application/octet-stream', 'unknown.bin');
      },
      /Unsupported binary file format/
    );
  });

  // 10. Evidence Matcher: Exact Substring
  await test('Evidence Matcher verifies verbatim exact quotes with accurate offsets', () => {
    const quote = 'We collect personal information that you provide to us';
    const result = verifyEvidenceQuote(quote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'verified');
    assert.strictEqual(result.matchScore, 1.0);
    assert(result.sourceOffsets, 'Expected source offsets');
    assert.strictEqual(SAMPLE_POLICY_TEXT.substring(result.sourceOffsets!.start_char, result.sourceOffsets!.end_char), quote);
  });

  // 11. Evidence Matcher: Normalized Contiguous Passage
  await test('Evidence Matcher verifies contiguous passage across whitespace/line-break variations', () => {
    const quote = 'We    collect\n\npersonal    information   that   you   provide to us';
    const result = verifyEvidenceQuote(quote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'approximate');
    assert.strictEqual(result.matchScore, 0.90);
    assert(result.sourceOffsets, 'Expected source offsets');
    assert(result.matchedText?.includes('personal information'));
  });

  // 12. Strict Rejection: Reordered Tokens
  await test('Evidence Matcher strictly rejects reordered tokens (anagrams/scrambled words)', () => {
    const scrambledQuote = 'personal collect information that us to provide you We';
    const result = verifyEvidenceQuote(scrambledQuote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'unverified');
    assert.strictEqual(result.matchScore, 0.0);
    assert.strictEqual(result.sourceOffsets, undefined);
  });

  // 13. Strict Rejection: Spliced Non-Contiguous Fragments
  await test('Evidence Matcher strictly rejects spliced non-contiguous fragments', () => {
    const splicedQuote = 'We collect personal information Cyber City Gurugram Haryana India';
    const result = verifyEvidenceQuote(splicedQuote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'unverified');
    assert.strictEqual(result.matchScore, 0.0);
  });

  // 14. Strict Rejection: Fabricated Quotes
  await test('Evidence Matcher strictly rejects fabricated / hallucinated quotes', () => {
    const fakeQuote = 'We sell your biometric DNA telemetry to offshore crypto hedge funds';
    const result = verifyEvidenceQuote(fakeQuote, SAMPLE_POLICY_TEXT);
    assert.strictEqual(result.status, 'unverified');
    assert.strictEqual(result.matchScore, 0.0);
  });

  // 15. Strict Rejection: Empty / Malformed Input
  await test('Evidence Matcher rejects empty or punctuation-only strings', () => {
    assert.strictEqual(verifyEvidenceQuote('', SAMPLE_POLICY_TEXT).status, 'unverified');
    assert.strictEqual(verifyEvidenceQuote('   ', SAMPLE_POLICY_TEXT).status, 'unverified');
    assert.strictEqual(verifyEvidenceQuote('... --- !!!', SAMPLE_POLICY_TEXT).status, 'unverified');
  });

  // 16. Policy Analyzer: Category Segmentation, Offsets & Provenance
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

  // 17. Policy Analyzer: Omission & Absence Semantics
  await test('Policy Analyzer flags omitted categories as not_found_in_analysed_text with unverified_omission', async () => {
    const minimalText = 'We collect your name and email. Contact us at support@example.com';
    const analysis = await analyzePolicyText(minimalText, 'Minimal Policy');
    const retentionClause = analysis.clauses.find((c) => c.category === 'retention_period');
    assert(retentionClause, 'Expected retention clause check');
    assert.strictEqual(retentionClause?.information_state, 'not_found_in_analysed_text');
    assert.strictEqual(retentionClause?.evidence_status, 'unverified');
    assert.strictEqual(retentionClause?.uncertainty_label, 'unverified_omission');
  });

  // 18. Redressal Draft: DPDP Section 6(4) Consent Withdrawal
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

  // 19. Redressal Draft: DPDP Section 12 Data Erasure
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

  // 20. Storage Adapter: Preferences Status Honesty
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

    // Revert for test idempotency
    await storage.updatePreference(first.id, {
      current_value: first.current_value,
      status: first.status,
      status_explanation: first.status_explanation,
    });
  });

  // 21. Storage Adapter: Append-Only Request Event Timeline
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

  // 22. Empirical Benchmark Evaluation Runner Test
  await test('Empirical Evaluation Runner executes over labeled dataset without errors', async () => {
    const { executeEvaluationBenchmark } = await import('./runEvaluation.js');
    const result = await executeEvaluationBenchmark({ forceFallback: true });
    assert(result.macroF1 > 0.85, `Expected Macro F1 > 0.85, got ${result.macroF1}`);
    assert(result.microF1 > 0.85, `Expected Micro F1 > 0.85, got ${result.microF1}`);
    assert(result.quoteMatchRate >= 95, `Expected quote match rate >= 95%, got ${result.quoteMatchRate}%`);
    assert.strictEqual(result.hallucinatedVerifiedQuotes, 0, 'Expected 0 hallucinated quotes');
    assert.strictEqual(result.totalExamples, 24, 'Expected 24 benchmark examples');
  });

  // 23. Official Legal Sources and URL Integrity Test
  await test('Official Legal Sources use verified MeitY endpoints and valid DPDP statutory mappings', () => {
    assert.strictEqual(
      OFFICIAL_LEGAL_URLS.meityDpdpActPage,
      'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023-dpdp-act'
    );
    assert.strictEqual(
      OFFICIAL_LEGAL_URLS.meityDpdpActPdf,
      'https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf'
    );
    assert.strictEqual(
      OFFICIAL_LEGAL_URLS.commencementGazettePdf,
      'https://egazette.gov.in/WriteReadData/2025/267647.pdf'
    );
    assert.strictEqual(
      OFFICIAL_LEGAL_URLS.commencementMeityPdf,
      'https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf'
    );
    assert.strictEqual(
      OFFICIAL_LEGAL_URLS.meityDpdpRulesCollection,
      'https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025'
    );
    assert.strictEqual(
      OFFICIAL_LEGAL_URLS.meityExplanatoryNotePdf,
      'https://www.meity.gov.in/data-protection-framework'
    );

    // Verify each provision has sound legal metadata, rationales, and caveats
    for (const [key, source] of Object.entries(DPDP_ACT_2023_SOURCES)) {
      assert(source.official_url?.startsWith('https://www.meity.gov.in/'), `Expected MeitY URL for ${key}`);
      assert(!source.official_url?.includes('indiacode.nic.in/handle/123456789/22037'), `Found obsolete India Code URL for ${key}`);
      assert(!source.official_url?.includes('guidelines-india-digital-personal-data-protection-act-2023'), `Found obsolete guideline URL for ${key}`);
      assert(source.statute.includes('DPDP Act'), `Expected DPDP Act statute for ${key}`);
      assert(source.section.length > 0, `Expected non-empty section for ${key}`);
      assert(source.rationale && source.rationale.length > 15, `Expected substantive rationale for ${key}`);
      assert(source.commencement_status, `Expected commencement_status for ${key}`);
      assert(source.commencement_details && source.commencement_details.includes('DPDP Act'), `Expected commencement details for ${key}`);
      assert(source.statutory_caveat && source.statutory_caveat.length > 15, `Expected substantive caveat for ${key}`);
    }

    // Verify statutory mappings for categories
    const noticeRef = getStatutoryReferenceForCategory('data_collection');
    assert.strictEqual(noticeRef?.section, 'Section 5');
    assert.strictEqual(noticeRef?.commencement_status, 'phased_commencement');

    const erasureRef = getStatutoryReferenceForCategory('consumer_rights');
    assert.strictEqual(erasureRef?.section, 'Section 12');
    assert.strictEqual(erasureRef?.commencement_status, 'phased_commencement');

    const grievanceRef = getStatutoryReferenceForCategory('grievance_contact');
    assert.strictEqual(grievanceRef?.section, 'Section 13');
    assert.strictEqual(grievanceRef?.commencement_status, 'phased_commencement');

    const retentionRef = getStatutoryReferenceForCategory('retention_period');
    assert.strictEqual(retentionRef?.section, 'Section 8(7)');
    assert(retentionRef?.statutory_caveat?.includes('statutory retention mandates'), 'Expected Section 8(7) retention caveat');
  });

  // 24. Date-Awareness and Redressal Draft Qualification Test
  await test('Generated Redressal Drafts qualify legal grounds accurately and respect Section 8(7) retention exemptions', () => {
    // 1. Consent withdrawal draft
    const withdrawalDraft = generateRedressalDraft({
      concern_type: 'consent_withdrawal',
      service_name: 'Alpha Retail',
      consumer_name: 'Pooja Roy',
      consumer_identifier: 'pooja@example.com',
    });

    assert(withdrawalDraft.body.includes('G.S.R. 843(E)'), 'Expected draft to cite Gazette G.S.R. 843(E)');
    assert(
      withdrawalDraft.body.includes('strictly required to comply with applicable statutory tax, financial, or regulatory obligations'),
      'Expected draft to respect Section 8(7) statutory retention mandates'
    );
    assert(!withdrawalDraft.body.includes('violated the law'), 'Draft should not assert an unproven legal violation');

    // 2. Data erasure draft
    const erasureDraft = generateRedressalDraft({
      concern_type: 'data_erasure',
      service_name: 'Beta Finance',
      consumer_name: 'Vikram Mehta',
      consumer_identifier: 'vikram@example.com',
    });

    assert(erasureDraft.body.includes('Section 12 of the Digital Personal Data Protection Act, 2023'));
    assert(
      erasureDraft.body.includes('statutory or regulatory requirements'),
      'Expected erasure draft to acknowledge statutory retention provisos'
    );

    // 3. Substantive provisions (Sections 5, 6, 8, 12, 13) are under phased commencement (18-month tranche, May 2027)
    assert.notStrictEqual(DPDP_ACT_2023_SOURCES.consent_withdrawal.commencement_status, 'in_force');
    assert.strictEqual(DPDP_ACT_2023_SOURCES.notice_requirements.commencement_status, 'phased_commencement');
    assert.strictEqual(DPDP_ACT_2023_SOURCES.consent_withdrawal.commencement_status, 'phased_commencement');
    assert.strictEqual(DPDP_ACT_2023_SOURCES.erasure_and_correction.commencement_status, 'phased_commencement');
    assert.strictEqual(DPDP_ACT_2023_SOURCES.grievance_redressal.commencement_status, 'phased_commencement');
    assert.strictEqual(DPDP_ACT_2023_SOURCES.board_establishment.commencement_status, 'in_force');
  });

  // 25. Persistent Storage: State Survives Simulated Backend Restart
  await test('Persistent Storage: Preferences, Requests, and Timelines survive restart', async () => {
    const testDir = path.resolve(process.cwd(), 'tests', 'fixtures', 'temp');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    const testStorePath = path.join(testDir, `test_store_${Date.now()}.json`);

    try {
      // 1. Initialize first adapter instance
      const adapter1 = new StorageAdapter(testStorePath);
      const createdReq = await adapter1.createRequest({
        service_name: 'Persistent Cloud Co',
        recipient_email: 'dpo@cloud.in',
        concern_type: 'data_erasure',
        status: 'saved',
        subject: 'Erasure Request #402',
        body_content: 'Please erase cloud logs.',
      });

      await adapter1.addRequestEvent(createdReq.id, {
        event_type: 'marked_as_sent',
        description: 'Manually sent via external email client',
        statusChange: 'sent_manually',
      });

      const prefs1 = await adapter1.getPreferences();
      const prefToUpdate = prefs1[0];
      await adapter1.updatePreference(prefToUpdate.id, {
        current_value: true,
        status: 'pending_manual_send',
        status_explanation: 'Opt-out marked for dispatch',
      });

      // 2. Instantiate a second adapter on the identical file path (simulating complete restart)
      const adapter2 = new StorageAdapter(testStorePath);
      const retrievedReq = await adapter2.getRequestById(createdReq.id);

      assert(retrievedReq, 'Expected request to persist across restart');
      assert.strictEqual(retrievedReq.id, createdReq.id);
      assert.strictEqual(retrievedReq.status, 'sent_manually');
      assert.strictEqual(retrievedReq.events.length, 2);
      assert.strictEqual(retrievedReq.events[1].event_type, 'marked_as_sent');

      const prefs2 = await adapter2.getPreferences();
      const restoredPref = prefs2.find((p) => p.id === prefToUpdate.id);
      assert(restoredPref, 'Expected preference to persist across restart');
      assert.strictEqual(restoredPref.current_value, true);
      assert.strictEqual(restoredPref.status, 'pending_manual_send');
    } finally {
      if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
      if (fs.existsSync(testDir)) {
        try { fs.rmdirSync(testDir); } catch {}
      }
    }
  });

  // 26. Persistent Storage: Safe Corruption Recovery and Backup
  await test('Persistent Storage: Corrupted storage file triggers safe backup and defaults initialization', async () => {
    const testDir = path.resolve(process.cwd(), 'tests', 'fixtures', 'temp');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    const corruptPath = path.join(testDir, `corrupt_store_${Date.now()}.json`);

    try {
      // Write corrupted non-JSON payload
      fs.writeFileSync(corruptPath, '<<< INVALID CORRUPTED JSON CONTENT >>>', 'utf-8');

      // Adapter should not throw, should load defaults and create .corrupt backup
      const adapter = new StorageAdapter(corruptPath);
      const prefs = await adapter.getPreferences();
      assert(prefs.length > 0, 'Expected default preferences loaded after corruption recovery');

      const dirFiles = fs.readdirSync(testDir);
      const backupFound = dirFiles.some((f) => f.includes('.corrupt'));
      assert(backupFound, 'Expected corrupted file backup to be created on disk');
    } finally {
      const files = fs.readdirSync(testDir);
      for (const f of files) {
        fs.unlinkSync(path.join(testDir, f));
      }
      if (fs.existsSync(testDir)) {
        try { fs.rmdirSync(testDir); } catch {}
      }
    }
  });

  // 27. Request Lifecycle: Guards Against Invalid State Transitions
  await test('Request Lifecycle: Validates sequential state transitions and rejects illegal regressions', async () => {
    const testDir = path.resolve(process.cwd(), 'tests', 'fixtures', 'temp');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    const lifecycleStorePath = path.join(testDir, `lifecycle_store_${Date.now()}.json`);

    try {
      const adapter = new StorageAdapter(lifecycleStorePath);
      const req = await adapter.createRequest({
        service_name: 'Lifecycle Telecom',
        recipient_email: 'grievance@telecom.in',
        concern_type: 'grievance_inquiry',
        status: 'draft',
        subject: 'Inquiry',
        body_content: 'Notice inquiry',
      });

      // draft -> saved
      await adapter.addRequestEvent(req.id, {
        event_type: 'saved',
        description: 'Draft saved in tracker',
        statusChange: 'saved',
      });

      // saved -> sent_manually
      await adapter.addRequestEvent(req.id, {
        event_type: 'marked_as_sent',
        description: 'Sent manually',
        statusChange: 'sent_manually',
      });

      // sent_manually -> resolved
      await adapter.addRequestEvent(req.id, {
        event_type: 'resolved',
        description: 'Company confirmed resolution',
        statusChange: 'resolved',
      });

      const resolved = await adapter.getRequestById(req.id);
      assert.strictEqual(resolved?.status, 'resolved');

      // Illegal transition: Attempting to regress resolved -> draft must be rejected
      let threw = false;
      try {
        await adapter.addRequestEvent(req.id, {
          event_type: 'reverted',
          description: 'Illegal attempt to revert resolved to draft',
          statusChange: 'draft',
        });
      } catch (err: any) {
        threw = true;
        assert(err.message.includes('Invalid status transition'), 'Expected transition error message');
      }
      assert.strictEqual(threw, true, 'Expected exception when attempting invalid state transition');
    } finally {
      if (fs.existsSync(lifecycleStorePath)) fs.unlinkSync(lifecycleStorePath);
      if (fs.existsSync(testDir)) {
        try { fs.rmdirSync(testDir); } catch {}
      }
    }
  });

  // 28. Security Middleware: Security Headers and Rate Limiter Enforcement
  await test('Security Middleware: Applies secure headers and enforces IP rate limiting under test flag', async () => {
    // 1. Headers test
    const mockHeaders: Record<string, string> = {};
    const mockRes: any = {
      setHeader: (name: string, value: string) => {
        mockHeaders[name.toLowerCase()] = value;
      },
    };
    let headersCalled = false;
    securityHeaders({} as any, mockRes, () => {
      headersCalled = true;
    });
    assert.strictEqual(headersCalled, true);
    assert.strictEqual(mockHeaders['x-content-type-options'], 'nosniff');
    assert.strictEqual(mockHeaders['x-frame-options'], 'SAMEORIGIN');

    // 2. Rate limiter test
    const testLimiter = createRateLimiter({ windowMs: 60_000, max: 3, message: 'Too many requests' });
    const standardReq: any = {
      headers: {},
      socket: { remoteAddress: '192.168.1.100' },
    };

    let blocked = false;
    let blockedStatusCode = 0;
    const resMock: any = {
      setHeader: () => {},
      getHeader: () => {},
      status: (code: number) => {
        blockedStatusCode = code;
        return {
          json: (body: any) => {
            if (code === 429) blocked = true;
          },
        };
      },
    };

    // Requests 1, 2, 3 should pass
    for (let i = 0; i < 3; i++) {
      let passed = false;
      testLimiter(standardReq, resMock, () => { passed = true; });
      assert.strictEqual(passed, true, `Request ${i + 1} should pass`);
    }

    // Request 4 should be rate-limited (HTTP 429)
    let passedNext = false;
    testLimiter(standardReq, resMock, () => { passedNext = true; });
    assert.strictEqual(passedNext, false, 'Request 4 must not call next()');
    assert.strictEqual(blocked, true, 'Request 4 must trigger rate limiter response');
    assert.strictEqual(blockedStatusCode, 429, 'Expected HTTP 429');
  });

  // 30. Rate Limiter Safety: Client Headers Cannot Bypass Rate Limiting
  await test('Rate Limiter Safety: Untrusted client headers cannot bypass production rate limiting', async () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: 'Too many requests' });
    const maliciousReq: any = {
      headers: {
        'x-test-rate-limit': 'true',
        'x-bypass-token': 'admin',
        'x-forwarded-for': '10.0.0.99',
      },
      socket: { remoteAddress: '10.0.0.99' },
    };

    let blocked = false;
    let statusCode = 0;
    const resMock: any = {
      setHeader: () => {},
      getHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return {
          json: () => {
            if (code === 429) blocked = true;
          },
        };
      },
    };

    // Requests 1 and 2 pass
    let p1 = false; limiter(maliciousReq, resMock, () => { p1 = true; }); assert.strictEqual(p1, true);
    let p2 = false; limiter(maliciousReq, resMock, () => { p2 = true; }); assert.strictEqual(p2, true);

    // Request 3 must be blocked with HTTP 429 despite x-test-rate-limit header
    let p3 = false;
    limiter(maliciousReq, resMock, () => { p3 = true; });
    assert.strictEqual(p3, false, 'Malicious request 3 must not proceed');
    assert.strictEqual(blocked, true, 'Rate limiter must enforce limit regardless of headers');
    assert.strictEqual(statusCode, 429, 'Expected HTTP 429');
  });

  // 29. Bounded Long-Document Analysis: Truncation Flag and Character Disclosures
  await test('Policy Analyzer: Bounded analysis flags truncation and unanalysed character counts honestly', async () => {
    const repeatedSection = `
    SECTION: DATA HANDLING POLICY
    We collect user contact email and order telemetry. All information is retained for 180 days.
    Users may contact our Grievance Officer at grievance@oversized-corp.in.
    `.repeat(250); // ~35,000 chars

    const analysis = await analyzePolicyText(repeatedSection, 'deterministic');
    assert.strictEqual(analysis.character_count, repeatedSection.length);
    assert.strictEqual(analysis.is_truncated, true);
    assert(analysis.unanalysed_chars_count! > 0, 'Expected unanalysed characters count > 0');
    assert(analysis.processing_notes?.includes('Analysis bounded to first 30000 characters'));
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
