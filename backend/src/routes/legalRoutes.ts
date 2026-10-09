import { Router, Request, Response } from 'express';
import { DPDP_ACT_2023_SOURCES, LEGAL_DISCLAIMER_TEXT } from '../data/legalSources.js';

export const legalRouter = Router();

// GET /api/legal-sources — Official references & statutory guide
legalRouter.get('/sources', (_req: Request, res: Response): void => {
  res.status(200).json({
    framework: 'Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules, 2025',
    jurisdiction: 'Republic of India',
    disclaimer: LEGAL_DISCLAIMER_TEXT,
    official_portals: [
      {
        title: 'Digital Personal Data Protection Act, 2023 (India Code)',
        url: 'https://www.indiacode.nic.in/handle/123456789/22037',
        description: 'Official text published in the Gazette of India on August 11, 2023.',
      },
      {
        title: 'Ministry of Electronics and Information Technology (MeitY)',
        url: 'https://www.meity.gov.in/content/guidelines-india-digital-personal-data-protection-act-2023',
        description: 'Guidelines, notifications, and rules under DPDP 2023.',
      },
      {
        title: 'Data Protection Board of India (DPBI)',
        url: 'https://www.meity.gov.in',
        description: 'Statutory appellate and adjudicatory body for unresolved grievances.',
      },
    ],
    provisions: Object.values(DPDP_ACT_2023_SOURCES),
  });
});
