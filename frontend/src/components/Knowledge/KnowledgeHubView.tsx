import React from 'react';
import { BookOpen, Scale, ShieldCheck, ExternalLink, FileText, AlertCircle } from 'lucide-react';

export const KnowledgeHubView: React.FC = () => {
  const sections = [
    {
      title: 'Digital Personal Data Protection Act, 2023 (DPDP Act)',
      description: 'The primary legislation governing processing of digital personal data within the Republic of India.',
      provisions: [
        {
          num: 'Section 5',
          title: 'Notice & Purpose Specification',
          summary: 'Requires every Data Fiduciary to give clear, itemised notice detailing the categories of personal data, purpose of processing, and grievance officer details before or at the time of seeking consent.',
        },
        {
          num: 'Section 6(1) & 6(4)',
          title: 'Consent & Ease of Withdrawal',
          summary: 'Consent must be free, specific, informed, unconditional, and unambiguous with clear affirmative action. Consumers have the right to withdraw consent with the exact same ease as giving it.',
        },
        {
          num: 'Section 8(5) & 8(7)',
          title: 'Security & Erasure Obligations',
          summary: 'Data Fiduciaries must implement reasonable security safeguards to prevent breaches and must erase personal data as soon as the purpose is served or consent is withdrawn.',
        },
        {
          num: 'Section 11 & 12',
          title: 'Right to Access, Correction & Erasure',
          summary: 'Consumers have the statutory right to obtain a summary of personal data being processed, correct misleading data, and request complete erasure.',
        },
        {
          num: 'Section 13',
          title: 'Right of Grievance Redressal',
          summary: 'Consumers must be provided readily accessible grievance redressal mechanisms with designated officers prior to approaching the Data Protection Board of India.',
        },
      ],
    },
    {
      title: 'Digital Personal Data Protection Rules, 2025',
      description: 'Regulatory standards prescribing compliance procedures, breach notification mechanisms, and timeline frameworks.',
      provisions: [
        {
          num: 'Rule 3',
          title: 'Format and Language of Notice',
          summary: 'Notice must be provided in English or any of the 22 languages specified in the Eighth Schedule to the Constitution of India.',
        },
        {
          num: 'Rule 7',
          title: 'Grievance Officer Response Timelines',
          summary: 'Stipulates designated response intervals for acknowledged complaints and escalation rights to the Data Protection Board.',
        },
      ],
    },
  ];

  const officialLinks = [
    {
      title: 'Digital Personal Data Protection Act, 2023 (Official India Code)',
      url: 'https://www.indiacode.nic.in/handle/123456789/22037',
    },
    {
      title: 'Ministry of Electronics and Information Technology (MeitY)',
      url: 'https://www.meity.gov.in/content/guidelines-india-digital-personal-data-protection-act-2023',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="text-xs font-bold text-sky-700 tracking-wider uppercase mb-1">
          LEGAL TRANSPARENCY & STATUTORY GUIDANCE
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Knowledge Hub & Consumer Rights Guide
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Explore official provisions under the Digital Personal Data Protection Act, 2023 and DPDP Rules, 2025 in clear plain language.
        </p>
      </div>

      {/* Official Portals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {officialLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/40 transition-all flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                {link.title}
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
          </a>
        ))}
      </div>

      {/* Statutory Sections Breakdown */}
      <div className="space-y-6">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{sec.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {sec.provisions.map((p, pIdx) => (
                <div key={pIdx} className="bg-slate-50/70 border border-slate-200/70 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800">{p.num}</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Statutory Ground</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{p.title}</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{p.summary}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimers & Responsible Use Notice */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <strong>Informational Disclaimer:</strong> PrivacyLens is a legal-technology demonstration platform developed for National Legal Hackathon 2.0. Summaries and drafts are provided for consumer awareness and structured self-advocacy. They do not constitute formal attorney-client counsel or guaranteed judicial rulings.
        </div>
      </div>
    </div>
  );
};
