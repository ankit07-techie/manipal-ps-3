import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { HeroIllustration } from '../Assets/HeroIllustration';

interface HeroBannerProps {
  onAnalyzeClick: () => void;
  onHowItWorksClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onAnalyzeClick,
  onHowItWorksClick,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-sky-50/70 via-indigo-50/30 to-blue-50/50 border border-slate-200/80 rounded-2xl p-7 lg:p-8 mb-6 shadow-2xs">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left Text Content */}
        <div className="max-w-xl">
          <div className="text-[11px] font-bold tracking-widest text-sky-800 uppercase mb-2">
            PRIVACY • CONSENT • REMEDIES
          </div>
          <h1 className="text-3xl lg:text-[38px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-3">
            Make sense of your data. Take control.
          </h1>
          <p className="text-xs lg:text-sm text-slate-600 leading-relaxed mb-6 max-w-lg">
            Upload a privacy policy, understand how your data is used, manage your consent preferences, and seek redressal – all in one place.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onAnalyzeClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all hover:translate-y-[-1px] cursor-pointer"
            >
              <span>Analyze a Policy</span>
              <ArrowRight className="w-4 h-4 text-slate-200" />
            </button>
            <button
              onClick={onHowItWorksClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-slate-700 fill-slate-700" />
              <span>How it works</span>
            </button>
          </div>
        </div>

        {/* Right Illustration & Pillars Graphic Matching Mockup */}
        <div className="hidden lg:block shrink-0">
          <HeroIllustration />
        </div>
      </div>
    </div>
  );
};

