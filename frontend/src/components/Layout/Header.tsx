import React, { useState } from 'react';
import { Search, Globe, Bell, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState<'English' | 'हिन्दी'>('English');

  const notifications = [
    {
      id: 1,
      title: 'Consent withdrawal draft ready',
      time: '10m ago',
      unread: true,
      type: 'success',
    },
    {
      id: 2,
      title: 'Zomato policy updated: Moderate Risk',
      time: '1h ago',
      unread: false,
      type: 'alert',
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Search Input from Mockup */}
      <div className="relative w-full max-w-xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for topics, rights, or ask a question..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Language Selector */}
        <button
          onClick={() => setLanguage(language === 'English' ? 'हिन्दी' : 'English')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>{language}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 border border-slate-200 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 font-bold text-slate-800 border-b border-slate-100 flex justify-between items-center">
                <span>Notifications</span>
                <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">
                  1 New
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    {n.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-800">{n.title}</div>
                      <div className="text-[10px] text-slate-400">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar from Mockup */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            A
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-800">Aarav Singh</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
