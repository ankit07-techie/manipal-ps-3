import { Router, Request, Response } from 'express';
import { DPDP_ACT_2023_SOURCES, LEGAL_DISCLAIMER_TEXT, OFFICIAL_LEGAL_URLS } from '../data/legalSources.js';

export const legalRouter = Router();

// GET /api/legal-sources — Official references & statutory guide
legalRouter.get('/sources', (_req: Request, res: Response): void => {
  res.status(200).json({
    framework: 'Digital Personal Data Protection Act, 2023 (DPDP Act), DPDP Rules, 2025 & Commencement Notification G.S.R. 843(E)',
    jurisdiction: 'Republic of India',
    evaluation_date: '2026-10-09',
    disclaimer: LEGAL_DISCLAIMER_TEXT,
    official_portals: [
      {
        title: 'Digital Personal Data Protection Act, 2023 (MeitY Official Portal)',
        url: OFFICIAL_LEGAL_URLS.meityDpdpActPage,
        description: 'Official primary legislation published by the Ministry of Electronics and Information Technology (MeitY).',
        document_type: 'primary_legislation',
      },
      {
        title: 'Digital Personal Data Protection Act, 2023 (MeitY Official PDF Enactment)',
        url: OFFICIAL_LEGAL_URLS.meityDpdpActPdf,
        description: 'MeitY-hosted official statutory enactment text (Act No. 22 of 2023).',
        document_type: 'statute_pdf',
      },
      {
        title: 'DPDP Act Commencement Notification (Gazette G.S.R. 843(E), 13 Nov 2025)',
        url: OFFICIAL_LEGAL_URLS.commencementGazettePdf,
        secondary_url: OFFICIAL_LEGAL_URLS.commencementMeityPdf,
        description: 'Official Central Government statutory commencement notification appointing phased enforcement dates pursuant to Section 1(2).',
        document_type: 'commencement_notification',
      },
      {
        title: 'DPDP Rules, 2025 Framework Collection (MeitY)',
        url: OFFICIAL_LEGAL_URLS.meityDpdpRulesCollection,
        description: 'Official subordinate rules and regulatory compliance standards published by MeitY.',
        document_type: 'subordinate_rules',
      },
      {
        title: 'MeitY Explanatory Note on DPDP Rules',
        url: OFFICIAL_LEGAL_URLS.meityExplanatoryNotePdf,
        description: 'Official explanatory memorandum clarifying administrative provisions (distinguished from statutory text).',
        document_type: 'explanatory_note',
      },
    ],
    provisions: Object.values(DPDP_ACT_2023_SOURCES),
  });
});


