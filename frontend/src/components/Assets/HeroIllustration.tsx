import React from 'react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="flex items-center gap-6 shrink-0 select-none">
      {/* Central Illustration matching NyayaNet Reference */}
      <div className="relative w-[340px] h-[190px] flex items-center justify-center">
        {/* Soft Organic Background Aura Blobs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 340 190" className="w-full h-full" fill="none">
            <path
              d="M110 30 C170 10, 240 20, 280 60 C320 100, 310 160, 240 180 C170 200, 80 180, 50 140 C20 100, 50 50, 110 30 Z"
              fill="#e0f2fe"
              opacity="0.75"
            />
            <path
              d="M160 50 C220 35, 275 45, 300 85 C325 125, 290 170, 230 175 C170 180, 120 160, 105 125 C90 90, 110 65, 160 50 Z"
              fill="#f0fdf4"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Floating Element 1: Left Document Sheet */}
        <div className="absolute left-6 top-6 bg-white/95 rounded-lg p-2.5 shadow-sm border border-slate-200/80 w-16 space-y-1.5 transform -rotate-6">
          <div className="w-full h-1.5 bg-slate-200 rounded-full" />
          <div className="w-4/5 h-1.5 bg-slate-200 rounded-full" />
          <div className="w-3/5 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Floating Element 2: Top Green Lock Badge */}
        <div className="absolute left-28 top-1 w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Floating Element 3: Center Shield with Check */}
        <div className="absolute left-20 top-18 w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-600 flex items-center justify-center backdrop-blur-xs">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        {/* Floating Element 4: Right Document Sheet */}
        <div className="absolute right-14 top-12 bg-white/95 rounded-lg p-2.5 shadow-sm border border-slate-200/80 w-20 space-y-1.5 transform rotate-3">
          <div className="w-full h-1.5 bg-slate-200 rounded-full" />
          <div className="w-5/6 h-1.5 bg-slate-200 rounded-full" />
          <div className="w-4/6 h-1.5 bg-slate-200 rounded-full" />
          <div className="w-3/6 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Floating Element 5: Right Scales of Justice Badge */}
        <div className="absolute right-10 top-3 w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-slate-800 flex items-center justify-center shadow-xs">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
            <path d="M7 21h10" />
            <path d="M12 3v18" />
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
          </svg>
        </div>

        {/* Central Character: Woman with Laptop (Vector SVG Art) */}
        <div className="relative z-10 w-36 h-36 flex items-end justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full">
            {/* Hair Back */}
            <path d="M45 55 Q35 90 40 125 Q55 130 65 110 Q55 75 60 55 Z" fill="#0f172a" />
            <path d="M115 55 Q125 90 120 125 Q105 130 95 110 Q105 75 100 55 Z" fill="#0f172a" />

            {/* Body / Sweater in Blue */}
            <path d="M48 110 C50 95, 110 95, 112 110 L122 155 L38 155 Z" fill="#3b82f6" />
            <path d="M68 110 Q80 120 92 110 Q80 102 68 110 Z" fill="#2563eb" />

            {/* Neck */}
            <rect x="74" y="80" width="12" height="15" fill="#fbcfe8" rx="2" />

            {/* Face */}
            <ellipse cx="80" cy="65" rx="16" ry="18" fill="#fde047" opacity="0.35" />
            <ellipse cx="80" cy="65" rx="15" ry="17" fill="#fed7aa" />

            {/* Hair Front */}
            <path d="M64 60 C64 45, 96 45, 96 60 C96 52, 90 48, 80 48 C70 48, 64 52, 64 60 Z" fill="#0f172a" />
            <path d="M65 55 Q75 62 82 56 Q75 50 65 55 Z" fill="#0f172a" />

            {/* Eyes & Smile */}
            <circle cx="75" cy="65" r="1.5" fill="#0f172a" />
            <circle cx="85" cy="65" r="1.5" fill="#0f172a" />
            <path d="M77 72 Q80 75 83 72" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />

            {/* Laptop Base & Screen */}
            <path d="M50 148 L110 148 L105 130 L55 130 Z" fill="#1e293b" />
            <path d="M55 130 L105 130 L102 108 L58 108 Z" fill="#334155" />
            <rect x="62" y="112" width="36" height="14" rx="1" fill="#e2e8f0" />
            <circle cx="80" cy="119" r="2" fill="#3b82f6" />
          </svg>
        </div>
      </div>

      {/* Right Pillar List Matching Mockup */}
      <div className="flex flex-col gap-2.5 border-l border-slate-200/80 pl-6 text-xs">
        <div className="font-semibold text-slate-700 hover:text-slate-900 transition-colors">
          Understand
        </div>
        <div className="font-semibold text-slate-700 hover:text-slate-900 transition-colors">
          Manage
        </div>
        <div className="font-semibold text-slate-700 hover:text-slate-900 transition-colors">
          Protect
        </div>
        <div>
          <div className="font-bold text-slate-900">
            Seek Redressal
          </div>
          <div className="w-8 h-0.5 bg-amber-500 rounded-full mt-1" />
        </div>
      </div>
    </div>
  );
};
