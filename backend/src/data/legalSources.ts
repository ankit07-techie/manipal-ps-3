import { StatutoryReference, ClauseCategory } from '../types.js';

export const DPDP_ACT_2023_SOURCES: Record<string, StatutoryReference> = {
  notice_requirements: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 5',
    title: 'Notice for seeking consent',
    summary: 'A Data Fiduciary must give itemised notice in clear, plain language detailing personal data to be processed, purpose, rights of Data Principal, and grievance officer details.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
  },
  consent_validity: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 6(1)',
    title: 'Valid Consent Requirements',
    summary: 'Consent must be free, specific, informed, unconditional, and unambiguous with a clear affirmative action for the specified purpose.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
  },
  consent_withdrawal: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 6(4)',
    title: 'Right to Withdraw Consent',
    summary: 'Data Principal has the right to withdraw consent at any time with the same ease with which consent was given.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
  },
  purpose_limitation: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 4(1)',
    title: 'Grounds for processing personal data',
    summary: 'Personal data may only be processed for lawful purposes for which the Data Principal has given consent or for certain legitimate uses.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
  },
  erasure_and_correction: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 12',
    title: 'Right to Correction and Erasure of Personal Data',
    summary: 'A Data Principal can request correction of inaccurate data and erasure of personal data that is no longer necessary for the specified purpose.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
  },
  grievance_redressal: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 13',
    title: 'Right of Grievance Redressal',
    summary: 'A Data Principal has the right to readily available grievance redressal from the Data Fiduciary before escalating to the Data Protection Board of India.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
  },
  security_safeguards: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 8(5)',
    title: 'Reasonable Security Safeguards',
    summary: 'Data Fiduciary must protect personal data by taking reasonable security safeguards to prevent personal data breaches.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
  },
  retention_limitation: {
    statute: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
    section: 'Section 8(7)',
    title: 'Data Retention & Erasure Obligations',
    summary: 'Data Fiduciary must erase personal data upon withdrawal of consent or as soon as the specified purpose has been achieved.',
    official_url: 'https://www.indiacode.nic.in/handle/123456789/22037',
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
  'PrivacyLens provides informational legal-technology analysis based on the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025. It does not constitute formal legal counsel or guarantee statutory compliance determinations.';
