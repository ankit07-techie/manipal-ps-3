import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { SAMPLE_POLICIES } from '../../services/api';

interface RecentAnalysesCardProps {
  onSelectPolicy: (policyText: string, title: string) => void;
  onSeeAll: () => void;
}

export const RecentAnalysesCard: React.FC<RecentAnalysesCardProps> = ({
  onSelectPolicy,
  onSeeAll,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Recent Analyses</h3>
          <button
            onClick={onSeeAll}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {SAMPLE_POLICIES.map((policy) => {
            const riskBadge =
              policy.riskColor === 'rose'
                ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                : policy.riskColor === 'amber'
                ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/80';

            return (
              <div
                key={policy.id}
                onClick={() => onSelectPolicy(policy.text, policy.title)}
                className="group cursor-pointer p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 group-hover:bg-white text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/50">
                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-sky-600 transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                      {policy.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      PDF • {policy.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${riskBadge}`}
                  >
                    {policy.riskLabel}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

