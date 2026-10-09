import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { KnowledgeBooksGraphic } from '../Assets/KnowledgeBooksGraphic';

interface KnowledgePromoCardProps {
  onExploreClick: () => void;
}

export const KnowledgePromoCard: React.FC<KnowledgePromoCardProps> = ({ onExploreClick }) => {
  return (
    <div className="bg-[#fef2f2]/80 border border-rose-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-900 font-bold text-sm">Not sure where to start?</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-5">
            Learn about your data rights, relevant laws and available remedies in simple language.
          </p>

          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-xs font-semibold shadow-2xs transition-all hover:translate-y-[-1px] cursor-pointer"
          >
            <span>Explore Knowledge Hub</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Stacked Legal Books Visual Graphic Matching Reference */}
        <KnowledgeBooksGraphic />
      </div>
    </div>
  );
};

