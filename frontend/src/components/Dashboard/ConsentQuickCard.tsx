import React, { useState } from 'react';
import { ShieldCheck, User, MapPin, Activity, Laptop, Users, ArrowRight } from 'lucide-react';

interface ConsentQuickCardProps {
  onManageClick: () => void;
}

export const ConsentQuickCard: React.FC<ConsentQuickCardProps> = ({ onManageClick }) => {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    personal: true,
    location: false,
    usage: true,
    device: false,
    sharing: false,
  });

  const toggleItem = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    { key: 'personal', label: 'Personal Information', icon: User },
    { key: 'location', label: 'Location Data', icon: MapPin },
    { key: 'usage', label: 'Usage & Activity', icon: Activity },
    { key: 'device', label: 'Device Information', icon: Laptop },
    { key: 'sharing', label: 'Third-party Sharing', icon: Users },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Your Consent</h3>
          </div>
          <button
            onClick={onManageClick}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Manage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          View and manage your consent preferences across different data categories.
        </p>

        <div className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isEnabled = toggles[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/50">
                    <Icon className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    {item.label}
                  </span>
                </div>

                {/* Switch Toggle matching reference: Blue when on, Grey when off */}
                <button
                  onClick={() => toggleItem(item.key)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
                    isEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

