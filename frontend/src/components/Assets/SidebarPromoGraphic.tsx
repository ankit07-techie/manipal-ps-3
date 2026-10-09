import React from 'react';

export const SidebarPromoGraphic: React.FC = () => {
  return (
    <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4 shadow-2xs relative overflow-hidden">
      <div className="flex items-center justify-center mb-3">
        {/* Scales on Legal Books Vector Graphic */}
        <svg viewBox="0 0 140 85" className="w-28 h-auto">
          {/* Leaves/Plant on Left */}
          <path d="M25 60 C15 45, 10 30, 20 20 C25 35, 30 45, 25 60 Z" fill="#86efac" opacity="0.8" />
          <path d="M30 65 C25 50, 28 35, 40 30 C38 45, 35 55, 30 65 Z" fill="#bbf7d0" opacity="0.9" />

          {/* Legal Books Base */}
          <rect x="25" y="65" width="90" height="8" rx="2" fill="#1e293b" />
          <rect x="30" y="58" width="80" height="7" rx="2" fill="#334155" />
          <line x1="28" y1="69" x2="112" y2="69" stroke="#94a3b8" strokeWidth="0.8" />
          <line x1="33" y1="61.5" x2="107" y2="61.5" stroke="#94a3b8" strokeWidth="0.8" />

          {/* Golden Balance Scales of Justice */}
          <line x1="70" y1="20" x2="70" y2="58" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="70" cy="18" r="3" fill="#d97706" />
          <line x1="45" y1="26" x2="95" y2="26" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />

          {/* Left Pan */}
          <line x1="45" y1="26" x2="38" y2="42" stroke="#b45309" strokeWidth="1" />
          <line x1="45" y1="26" x2="52" y2="42" stroke="#b45309" strokeWidth="1" />
          <path d="M36 42 Q45 47 54 42 Z" fill="#f59e0b" />

          {/* Right Pan */}
          <line x1="95" y1="26" x2="88" y2="42" stroke="#b45309" strokeWidth="1" />
          <line x1="95" y1="26" x2="102" y2="42" stroke="#b45309" strokeWidth="1" />
          <path d="M86 42 Q95 47 104 42 Z" fill="#f59e0b" />
        </svg>
      </div>

      <div className="text-left">
        <div className="font-bold text-xs leading-snug tracking-tight text-slate-900">
          Informed Consumers
        </div>
        <div className="font-bold text-xs leading-snug tracking-tight text-slate-900">
          Stronger Rights.
        </div>
        <div className="w-8 h-0.5 bg-amber-500 rounded-full mt-2" />
      </div>
    </div>
  );
};
