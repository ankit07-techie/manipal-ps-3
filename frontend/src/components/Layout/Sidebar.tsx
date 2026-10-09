import React from 'react';
import {
  Home,
  FileText,
  ShieldCheck,
  MessageSquarePlus,
  Clock,
  BookOpen,
  Settings,
  HelpCircle,
  Scale,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'analyze'
  | 'consent'
  | 'raise'
  | 'track'
  | 'knowledge'
  | 'settings'
  | 'help';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'analyze' as NavTab, label: 'Analyze Policy', icon: FileText },
    { id: 'consent' as NavTab, label: 'My Consent', icon: ShieldCheck },
    { id: 'raise' as NavTab, label: 'Raise a Request', icon: MessageSquarePlus },
    { id: 'track' as NavTab, label: 'Track Requests', icon: Clock },
    { id: 'knowledge' as NavTab, label: 'Knowledge Hub', icon: BookOpen },
  ];

  const secondaryNavItems = [
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
    { id: 'help' as NavTab, label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div>
        <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/10">
            <Scale className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
              NyayaNet
            </div>
            <div className="text-[11px] text-slate-500 font-medium tracking-wide">
              Your Data. Your Rights.
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation & Decorative Banner */}
      <div className="p-4 space-y-3">
        <div className="space-y-1 border-t border-slate-100 pt-3">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Banner from Mockup */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2.5 text-sky-400">
              <Scale className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs leading-snug tracking-wide text-white">
              Informed Consumers
            </div>
            <div className="font-bold text-xs leading-snug text-sky-400 mb-1">
              Stronger Rights.
            </div>
            <div className="w-6 h-0.5 bg-amber-400 rounded-full mt-1.5" />
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-sky-500/10 rounded-full blur-lg pointer-events-none" />
        </div>
      </div>
    </aside>
  );
};
