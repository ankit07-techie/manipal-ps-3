import { StatutoryReference, ClauseCategory } from '../types.js';

export const OFFICIAL_LEGAL_URLS = {
  meityDpdpActPage: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023-dpdp-act',
  meityDpdpActPdf: 'https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023-1.pdf',
  meityDpdpRulesCollection: 'https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025',
  meityDataProtectionFramework: 'https://www.meity.gov.in/data-protection-framework',
  meityExplanatoryNotePdf: 'https://www.meity.gov.in/data-protection-framework',
  commencementGazettePdf: 'https://egazette.gov.in/WriteReadData/2025/267647.pdf',
  commencementMeityPdf: 'https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf',
};

export const DPDP_ACT_2023_SOURCES: Record<string, StatutoryReference> = {
  notice_requirements: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 5',
    title: 'Notice for Seeking Consent & Information Requirements',
    summary: 'A Data Fiduciary must give itemised notice in clear, plain language detailing personal data categories to be processed, purpose, Data Principal rights, and Grievance Officer details before or at the time of seeking consent.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Establishes pre-consent transparency standards. Relevant for evaluating whether privacy notices specify categories of personal data, purpose, and contact mechanisms.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted under DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) pursuant to Gazette Notification G.S.R. 843(E) dated 13 November 2025.',
    statutory_caveat: 'Pre-existing processing notices receive transitional adjustment periods as prescribed by Central Government rules.',
  },
  consent_validity: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 6(1)',
    title: 'Requisites of Valid Consent',
    summary: 'Consent must be free, specific, informed, unconditional, and unambiguous with a clear affirmative action for the specified purpose, limited to such personal data as is necessary for such purpose.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Establishes the qualitative legal standard for valid consent in contrast to bundled or dark-pattern defaults.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted under Section 6(1) of DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) under Gazette Notification G.S.R. 843(E). Serves as benchmark standard during phased transition.',
    statutory_caveat: 'Applies to consent-grounded processing; distinct from non-consent legitimate uses permitted under Section 4(1)(b) and Section 7.',
  },
  consent_withdrawal: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 6(4)',
    title: 'Right to Withdraw Consent with Comparable Ease',
    summary: 'Data Principals possess the statutory right to withdraw consent at any time, with the ease of doing so being comparable to the ease with which consent was originally given.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Governs consumer-initiated consent revocation mechanisms and opt-out workflows.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted under Section 6(4) of DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) under Gazette G.S.R. 843(E).',
    statutory_caveat: 'Withdrawal of consent does not affect the legality of data processing prior to withdrawal, nor does it override mandatory retention required under other statutory laws.',
  },
  purpose_limitation: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 4(1)',
    title: 'Lawful Purpose Grounds for Processing',
    summary: 'Personal data may only be processed for a lawful purpose for which the Data Principal has given consent, or for certain legitimate uses recognized under the statute.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Establishes the statutory foundation that all data processing must tie to a declared, lawful purpose.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted statutory standard under Section 4(1) of DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) under Gazette Notification G.S.R. 843(E).',
    statutory_caveat: 'Section 4(1) provides legal processing grounds; it does not prescribe internal commercial business models.',
  },
  erasure_and_correction: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 12',
    title: 'Right to Correction, Completion, Updating & Erasure',
    summary: 'A Data Principal can request correction of inaccurate or misleading data, completion of incomplete data, updating, and erasure of personal data that is no longer necessary for the specified purpose.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Provides statutory basis for consumer-initiated rights requests to correct, update, or erase personal data.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted under Section 12 of DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) under Gazette G.S.R. 843(E).',
    statutory_caveat: 'Erasure under Section 12(1) is subject to the data no longer being necessary for the specified purpose or for compliance with any law.',
  },
  grievance_redressal: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 13',
    title: 'Right of Grievance Redressal and Fiduciary Response Channels',
    summary: 'A Data Principal has the right to readily available grievance redressal mechanisms from the Data Fiduciary before escalating to the Data Protection Board of India.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Prescribes mandatory first-tier grievance channels for consumer dispute resolution.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted under Section 13 of DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) under Gazette Notification G.S.R. 843(E).',
    statutory_caveat: 'Consumers must exhaust internal grievance redressal with the Data Fiduciary before filing formal complaints before the Data Protection Board of India.',
  },
  security_safeguards: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 8(5)',
    title: 'Reasonable Security Safeguards Obligation',
    summary: 'A Data Fiduciary must protect personal data in its possession or under its control by taking reasonable security safeguards to prevent personal data breaches.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Governs organizational and technical security measures required of data fiduciaries and processors.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted fiduciary safeguard duty under Section 8(5) of DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) under Gazette Notification G.S.R. 843(E).',
    statutory_caveat: 'Specific technical standards and breach reporting protocols operate in conjunction with subordinate DPDP Rules and CERT-In directions.',
  },
  retention_limitation: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 8(7)',
    title: 'Data Retention Limitation and Erasure on Purpose Fulfillment',
    summary: 'A Data Fiduciary must erase personal data upon withdrawal of consent or as soon as it is reasonable to assume that the specified purpose is no longer being served, unless retention is necessary for compliance with any law.',
    official_url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
    rationale: 'Defines the statutory duty to limit data retention post-purpose or post-consent withdrawal.',
    commencement_status: 'phased_commencement',
    commencement_details: 'Enacted statutory obligation under Section 8(7) of DPDP Act 2023; scheduled for substantive commencement on 13 May 2027 (18-month tranche) under Gazette Notification G.S.R. 843(E).',
    statutory_caveat: 'Section 8(7) explicitly preserves statutory retention mandates: erasure is not required where retention is necessary for compliance with tax, financial (e.g. RBI/PMLA), or other statutory legal requirements.',
  },
  board_establishment: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Sections 18–26',
    title: 'Establishment & Functioning of the Data Protection Board of India',
    summary: 'Provisions empowering the Central Government to establish the Board, appoint the Chairperson and Members, and institute administrative proceedings.',
    official_url: OFFICIAL_LEGAL_URLS.commencementMeityPdf,
    rationale: 'Constitutes the administrative adjudicatory authority for digital data protection disputes.',
    commencement_status: 'in_force',
    commencement_details: 'Commenced under DPDP Act 2023 immediately upon publication of Gazette Notification G.S.R. 843(E) on 13 November 2025.',
    statutory_caveat: 'In force for administrative and institutional readiness; substantive complaints against fiduciaries operative from May 2027.',
  }
};

export function getStatutoryReferenceForCategory(category: ClauseCategory): StatutoryReference | undefined {
  switch (category) {
    case 'data_collection':
      return DPDP_ACT_2023_SOURCES.notice_requirements;
    case 'purpose_specification':
      return DPDP_ACT_2023_SOURCES.purpose_limitation;
    case 'consent_and_choices':
      return DPDP_ACT_2023_SOURCES.consent_validity;
    case 'retention_period':
      return DPDP_ACT_2023_SOURCES.retention_limitation;
    case 'consumer_rights':
      return DPDP_ACT_2023_SOURCES.erasure_and_correction;
    case 'grievance_contact':
      return DPDP_ACT_2023_SOURCES.grievance_redressal;
    case 'security_practices':
      return DPDP_ACT_2023_SOURCES.security_safeguards;
    case 'third_party_sharing':
      return DPDP_ACT_2023_SOURCES.notice_requirements;
    default:
      return undefined;
  }
}

export const LEGAL_DISCLAIMER_TEXT =
  'PrivacyLens provides informational legal-technology analysis based on the Digital Personal Data Protection Act, 2023 (DPDP Act), published DPDP Rules, 2025, and official Commencement Notification G.S.R. 843(E) dated 13 November 2025. Specific statutory obligations and Board procedures take effect subject to phased Central Government commencement schedules. Generated materials support consumer inquiry and self-advocacy and do not constitute formal legal counsel or findings of statutory violation.';
