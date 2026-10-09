import { v4 as uuidv4 } from 'uuid';
import {
  AnalysedClause,
  ConcernType,
  RedressalDraft,
  RedressalDraftRequest,
  StatutoryReference,
} from '../types.js';
import { DPDP_ACT_2023_SOURCES, LEGAL_DISCLAIMER_TEXT } from '../data/legalSources.js';

export function generateRedressalDraft(
  request: RedressalDraftRequest,
  availableClauses: AnalysedClause[] = []
): RedressalDraft {
  const draftId = uuidv4();
  const serviceName = request.service_name || 'Service Provider / Data Fiduciary';
  const consumerName = request.consumer_name || '[Consumer / Data Principal Name]';
  const consumerId = request.consumer_identifier || '[Registered Email / Account ID]';
  const recipientEmail = request.recipient_email || 'grievance-officer@service.example.com';
  const userNotes = request.user_notes ? request.user_notes.trim() : '';

  // Match selected clauses
  const referencedClauses: RedressalDraft['referenced_clauses'] = [];
  const citations: StatutoryReference[] = [];

  if (request.selected_clause_ids && request.selected_clause_ids.length > 0) {
    for (const id of request.selected_clause_ids) {
      const found = availableClauses.find((c) => c.clause_id === id);
      if (found) {
        referencedClauses.push({
          clause_id: found.clause_id,
          category: found.category,
          evidence_quote: found.evidence_quote,
          plain_language_explanation: found.plain_language_explanation,
        });
        if (found.legal_reference) {
          citations.push(found.legal_reference);
        }
      }
    }
  }

  let subject = '';
  let body = '';

  const clauseEvidenceBlock =
    referencedClauses.length > 0
      ? `\nRELEVANT PRIVACY POLICY CLAUSES IDENTIFIED:\n` +
        referencedClauses
          .map(
            (c, idx) =>
              `${idx + 1}. [${c.category.toUpperCase()}]\n   - Plain Summary: ${c.plain_language_explanation}\n   - Document Evidence: "${c.evidence_quote || 'Not specified in analysed text'}"`
          )
          .join('\n\n')
      : '';

  switch (request.concern_type) {
    case 'consent_withdrawal': {
      citations.push(DPDP_ACT_2023_SOURCES.consent_withdrawal, DPDP_ACT_2023_SOURCES.retention_limitation);
      subject = `Notice of Consent Withdrawal under Section 6(4) of DPDP Act 2023 — ${serviceName}`;
      body = `To,
The Grievance Officer / Data Protection Officer,
${serviceName}
Email: ${recipientEmail}

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

SUBJECT: Notice of Withdrawal of Consent under Section 6(4) of the Digital Personal Data Protection Act, 2023

Dear Grievance Officer,

I am writing as a registered consumer / Data Principal of ${serviceName} (Account identifier: ${consumerId}).

Pursuant to Section 6(4) of the Digital Personal Data Protection Act, 2023 (enacted and notified under Gazette G.S.R. 843(E)), I hereby exercise my statutory entitlement to WITHDRAW CONSENT for the processing of my personal data for secondary purposes, marketing communications, algorithmic profiling, and non-essential third-party sharing.

${userNotes ? `SPECIFIC CONSUMER CONTEXT:\n${userNotes}\n` : ''}${clauseEvidenceBlock}

STATUTORY GROUNDS & REQUESTED ACTIONS:
1. Cease processing of my personal data for the specified consent-based purposes upon receipt of this notice.
2. In accordance with Section 8(7) of the DPDP Act 2023, erase all personal data processed on the basis of consent, except where continued retention is strictly required to comply with applicable statutory tax, financial, or regulatory obligations.
3. Provide formal written acknowledgement confirming the receipt of this withdrawal and specifying any data categories retained under statutory legal exemptions.

I look forward to your prompt response through your designated grievance redressal mechanism.

Sincerely,
${consumerName}
Contact: ${consumerId}`;
      break;
    }

    case 'data_erasure': {
      citations.push(DPDP_ACT_2023_SOURCES.erasure_and_correction, DPDP_ACT_2023_SOURCES.retention_limitation);
      subject = `Request for Data Erasure under Section 12 of DPDP Act 2023 — ${serviceName}`;
      body = `To,
The Grievance Officer / Data Protection Officer,
${serviceName}
Email: ${recipientEmail}

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

SUBJECT: Request for Erasure of Personal Data under Section 12 of the DPDP Act, 2023

Dear Grievance Officer,

I am writing as a Data Principal regarding personal data held by ${serviceName} (Account identifier: ${consumerId}).

Under Section 12 of the Digital Personal Data Protection Act, 2023, a Data Principal has the right to seek the erasure of personal data that is no longer necessary for the purpose for which it was processed.

${userNotes ? `SPECIFIC DETAILS OF ERASURE REQUEST:\n${userNotes}\n` : ''}${clauseEvidenceBlock}

REQUESTED RELIEF:
1. Erase personal data, telemetry, and associated account records that are no longer necessary for primary service fulfillment.
2. In accordance with the Section 8(7) and Section 12 statutory provisos, if any category of my data must be retained under applicable statutory or regulatory requirements (e.g. tax, accounting, or anti-fraud laws), please identify the specific legal ground and applicable retention timeframe.
3. Provide written confirmation of the action taken.

Sincerely,
${consumerName}
Contact: ${consumerId}`;
      break;
    }

    case 'unclear_sharing':
    case 'unauthorized_tracking': {
      citations.push(DPDP_ACT_2023_SOURCES.notice_requirements, DPDP_ACT_2023_SOURCES.grievance_redressal);
      subject = `Inquiry regarding Third-Party Data Disclosures & Notice Adequacy — ${serviceName}`;
      body = `To,
The Grievance Officer,
${serviceName}
Email: ${recipientEmail}

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

SUBJECT: Inquiry & Clarification on Data Sharing Practices under DPDP Act 2023 Section 5

Dear Grievance Officer,

I am a consumer of ${serviceName} (Identifier: ${consumerId}) seeking clarification on the personal data sharing and disclosure practices set forth in your privacy notice.

Under Section 5 of the Digital Personal Data Protection Act, 2023, data fiduciaries are required to provide clear, itemised notice detailing the categories of personal data processed, the purposes of processing, and third-party disclosure channels.

${userNotes ? `CONSUMER CONCERN / INQUIRY CONTEXT:\n${userNotes}\n` : ''}${clauseEvidenceBlock}

CLARIFICATION REQUESTED:
1. An itemised summary of third-party partners, advertising networks, or analytics vendors that have received or process my personal data.
2. Clarification on whether cross-border data transfers occur and the safeguards in place.
3. Guidance on available options to restrict non-essential third-party sharing.

Please provide a formal response through your designated redressal channel.

Sincerely,
${consumerName}
Contact: ${consumerId}`;
      break;
    }

    default: {
      citations.push(DPDP_ACT_2023_SOURCES.grievance_redressal, DPDP_ACT_2023_SOURCES.notice_requirements);
      subject = `Grievance Redressal Request under Section 13 of DPDP Act 2023 — ${serviceName}`;
      body = `To,
The Grievance Officer,
${serviceName}
Email: ${recipientEmail}

Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

SUBJECT: Consumer Privacy Inquiry & Redressal Request under Section 13 of the DPDP Act, 2023

Dear Grievance Officer,

I am writing to submit a formal privacy inquiry and request for redressal regarding ${serviceName} (Account identifier: ${consumerId}).

Pursuant to Section 13 of the Digital Personal Data Protection Act, 2023, I am submitting this matter to your designated internal grievance redressal mechanism for review and resolution.

${userNotes ? `DESCRIPTION OF CONSUMER CONCERN:\n${userNotes}\n` : ''}${clauseEvidenceBlock}

EXPECTED RESOLUTION:
1. Registration and acknowledgment of this request with a tracking reference.
2. A clear explanation or appropriate corrective steps regarding the matter outlined above.
3. Written response within the timeline stipulated under applicable DPDP framework rules.

Sincerely,
${consumerName}
Contact: ${consumerId}`;
      break;
    }
  }

  // Deduplicate citations
  const uniqueCitations = Array.from(new Map(citations.map((c) => [c.section, c])).values());

  return {
    draft_id: draftId,
    concern_type: request.concern_type,
    service_name: serviceName,
    recipient_email: recipientEmail,
    subject,
    body,
    statutory_citations: uniqueCitations,
    referenced_clauses: referencedClauses,
    disclaimer: LEGAL_DISCLAIMER_TEXT,
    created_at: new Date().toISOString(),
  };
}
