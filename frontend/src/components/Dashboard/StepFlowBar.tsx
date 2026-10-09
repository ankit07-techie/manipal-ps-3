import React from 'react';
import { FileUp, Search, ShieldCheck, Gavel, ChevronRight } from 'lucide-react';

interface StepFlowBarProps {
  onStepClick: (stepIndex: number) => void;
}

export const StepFlowBar: React.FC<StepFlowBarProps> = ({ onStepClick }) => {
  const steps = [
    {
      step: 1,
      title: 'Upload Policy',
      desc: 'PDF, DOCX, TXT or paste text',
      icon: FileUp,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      step: 2,
      title: 'Get Insights',
      desc: 'Key clauses & data practices',
      icon: Search,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      step: 3,
      title: 'Manage Consent',
      desc: 'Set preferences and exercise rights',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      step: 4,
      title: 'Take Action',
      desc: 'Raise a request or seek remedy',
      icon: Gavel,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {steps.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={s.step}
            onClick={() => onStepClick(s.step)}
            className="group cursor-pointer bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl p-4 flex items-center justify-between shadow-2xs transition-all hover:shadow-xs hover:border-slate-300"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.color} shrink-0 shadow-2xs`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Step {s.step}</span>
                  <span className="text-xs font-bold text-slate-800">{s.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                  {s.desc}
                </div>
              </div>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors hidden lg:block shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
};
