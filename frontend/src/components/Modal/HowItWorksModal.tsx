import React from 'react';
import { X, CheckCircle2, ShieldCheck, Scale, FileText } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-xs font-bold text-sky-700 uppercase tracking-widest mb-1">
          SYSTEM ARCHITECTURE & TRANSPARENCY
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-4">
          How NyayaNet / PrivacyLens Works
        </h3>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed mb-6">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div>
              <strong className="text-slate-900 block mb-0.5">Deterministic Evidence Verification</strong>
              Every AI explanation is linked to an exact quotation. The backend matches the quote character-by-character against raw source text, flagging any unverified assertions.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div>
              <strong className="text-slate-900 block mb-0.5">Explicit Uncertainty & Omission States</strong>
              If a policy fails to disclose data retention or grievance contacts, the system marks the section as <em>"not_found_in_analysed_text"</em> rather than fabricating an assumption.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div>
              <strong className="text-slate-900 block mb-0.5">DPDP Act 2023 Statutory Grounding</strong>
              Grievance inquiries, consent withdrawals, and erasure requests are grounded in specific statutory sections (Sec 5, 6(4), 12, 13) with full consumer editability.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
        >
          Got it, return to dashboard
        </button>
      </div>
    </div>
  );
};
