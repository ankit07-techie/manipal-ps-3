import React from 'react';
import { ArrowRight, Play, Shield, Lock, FileSearch, Scale } from 'lucide-react';

interface HeroBannerProps {
  onAnalyzeClick: () => void;
  onHowItWorksClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onAnalyzeClick,
  onHowItWorksClick,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-sky-50 via-indigo-50/50 to-blue-50/70 border border-sky-100 rounded-2xl p-8 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left Text Content */}
        <div className="max-w-2xl">
          <div className="text-[11px] font-bold tracking-widest text-sky-700 uppercase mb-2">
            PRIVACY • CONSENT • REMEDIES
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
            Make sense of your data. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-indigo-800">
              Take control.
            </span>
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-xl">
            Upload a privacy policy, understand how your data is used, manage your consent preferences, and seek redressal – all in one place with verified evidence under Indian data law.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onAnalyzeClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/10 transition-all hover:translate-y-[-1px]"
            >
              <span>Analyze a Policy</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={onHowItWorksClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold shadow-xs transition-all"
            >
              <Play className="w-3.5 h-3.5 text-sky-600 fill-sky-600" />
              <span>How it works</span>
            </button>
          </div>
        </div>

        {/* Right Pillars Graphic Matching Mockup */}
        <div className="hidden lg:flex items-center gap-6 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center w-24">
            <div className="w-11 h-11 rounded-xl bg-sky-100/70 text-sky-700 flex items-center justify-center shadow-xs">
              <FileSearch className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Understand</span>
            <span className="text-[10px] text-slate-500">Evidence quotes</span>
          </div>

          <div className="w-px h-12 bg-slate-200" />

          <div className="flex flex-col items-center gap-2 text-center w-24">
            <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Manage</span>
            <span className="text-[10px] text-slate-500">Consent logs</span>
          </div>

          <div className="w-px h-12 bg-slate-200" />

          <div className="flex flex-col items-center gap-2 text-center w-24">
            <div className="w-11 h-11 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Protect</span>
            <span className="text-[10px] text-slate-500">Data rights</span>
          </div>

          <div className="w-px h-12 bg-slate-200" />

          <div className="flex flex-col items-center gap-2 text-center w-24">
            <div className="w-11 h-11 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Seek Redressal</span>
            <span className="text-[10px] text-slate-500">DPDP Act 2023</span>
          </div>
        </div>
      </div>

      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
