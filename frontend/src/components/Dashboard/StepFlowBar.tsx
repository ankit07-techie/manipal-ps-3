import React from 'react';
import { FileText, Search, ShieldCheck, Gavel, ChevronRight } from 'lucide-react';

interface StepFlowBarProps {
  onStepClick: (stepIndex: number) => void;
}

export const StepFlowBar: React.FC<StepFlowBarProps> = ({ onStepClick }) => {
  const steps = [
    {
      step: 1,
      title: 'Upload Policy',
      desc: 'PDF, DOCX, TXT or paste text',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      step: 2,
      title: 'Get Insights',
      desc: 'Key clauses & data practices',
      icon: Search,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      step: 3,
      title: 'Manage Consent',
      desc: 'Set preferences and exercise your rights',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      step: 4,
      title: 'Take Action',
      desc: 'Raise a request or seek appropriate remedy',
      icon: Gavel,
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 md:p-4 mb-6 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              onClick={() => onStepClick(s.step)}
              className="group cursor-pointer flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} shrink-0 shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">{s.step}</span>
                    <span className="text-xs font-bold text-slate-900">{s.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {s.desc}
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors hidden lg:block shrink-0 ml-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

