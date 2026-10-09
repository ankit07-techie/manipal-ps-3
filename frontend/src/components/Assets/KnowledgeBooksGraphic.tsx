import React from 'react';

export const KnowledgeBooksGraphic: React.FC = () => {
  return (
    <div className="relative w-44 h-28 flex items-center justify-center shrink-0 select-none">
      <svg viewBox="0 0 180 110" className="w-full h-full">
        {/* Plant / Green Leaf Background Accent */}
        <path d="M140 70 C160 55, 175 35, 165 15 C150 25, 145 45, 140 70 Z" fill="#86efac" opacity="0.85" />
        <path d="M145 80 C165 70, 175 55, 172 40 C158 48, 150 62, 145 80 Z" fill="#bbf7d0" opacity="0.9" />

        {/* Stack of 4 Legal Books with Spines Facing Forward matching Mockup */}

        {/* Book 4 (Bottom Navy): How to File a Complaint */}
        <rect x="15" y="78" width="145" height="18" rx="3" fill="#1e3a8a" />
        <line x1="20" y1="78" x2="20" y2="96" stroke="#172554" strokeWidth="2" />
        <text x="30" y="90" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
          How to File a Complaint
        </text>

        {/* Book 3 (Crimson/Burgundy): Consumer Laws */}
        <rect x="20" y="58" width="138" height="18" rx="3" fill="#991b1b" />
        <line x1="25" y1="58" x2="25" y2="76" stroke="#7f1d1d" strokeWidth="2" />
        <text x="35" y="70" fill="#fecdd3" fontSize="9" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
          Consumer Laws
        </text>

        {/* Book 2 (Dark Slate): Data Protection */}
        <rect x="26" y="38" width="130" height="18" rx="3" fill="#1e293b" />
        <line x1="31" y1="38" x2="31" y2="56" stroke="#0f172a" strokeWidth="2" />
        <text x="40" y="50" fill="#67e8f9" fontSize="9" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
          Data Protection
        </text>

        {/* Book 1 (Top Slate/Indigo): Your Rights */}
        <rect x="32" y="18" width="120" height="18" rx="3" fill="#0f172a" />
        <line x1="37" y1="18" x2="37" y2="36" stroke="#020617" strokeWidth="2" />
        <text x="45" y="30" fill="#93c5fd" fontSize="9" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
          Your Rights
        </text>
      </svg>
    </div>
  );
};
