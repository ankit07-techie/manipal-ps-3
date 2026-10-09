import React from 'react';
import { BookOpen, ArrowRight, BookMarked, ShieldCheck, Scale, FileText } from 'lucide-react';

interface KnowledgePromoCardProps {
  onExploreClick: () => void;
}

export const KnowledgePromoCard: React.FC<KnowledgePromoCardProps> = ({ onExploreClick }) => {
  return (
    <div className="bg-gradient-to-br from-rose-50/60 via-orange-50/40 to-amber-50/50 border border-orange-200/50 rounded-2xl p-6 shadow-2xs flex flex-col justify-between relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-2">
            <div className="w-7 h-7 rounded-lg bg-orange-100/80 text-orange-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span>Not sure where to start?</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-5">
            Learn about your data rights under the DPDP Act 2023, relevant consumer protection laws, and available remedies in simple language.
          </p>

          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all hover:translate-y-[-1px]"
          >
            <span>Explore Knowledge Hub</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
          </button>
        </div>

        {/* Stacked Legal Books Visual Graphic Matching Mockup */}
        <div className="flex flex-col gap-1.5 w-48 shrink-0">
          <div className="bg-slate-800 text-sky-300 text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Your Rights</span>
            </div>
            <span className="text-[9px] text-slate-400">DPDP</span>
          </div>
          <div className="bg-slate-900 text-emerald-300 text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3 h-3" />
              <span>Data Protection</span>
            </div>
            <span className="text-[9px] text-slate-400">Act 2023</span>
          </div>
          <div className="bg-rose-900 text-rose-200 text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm border border-rose-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookMarked className="w-3 h-3" />
              <span>Consumer Laws</span>
            </div>
            <span className="text-[9px] text-rose-300/70">India</span>
          </div>
          <div className="bg-sky-900 text-sky-200 text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm border border-sky-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              <span>How to File a Complaint</span>
            </div>
            <span className="text-[9px] text-sky-300/70">Guide</span>
          </div>
        </div>
      </div>
    </div>
  );
};
