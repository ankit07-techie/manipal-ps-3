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
import { SidebarPromoGraphic } from '../Assets/SidebarPromoGraphic';

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
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none shadow-[1px_0_3px_rgba(0,0,0,0.02)] z-20">
      {/* Brand Header */}
      <div>
        <div className="p-6 pb-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Scale className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight text-slate-900">
              NyayaNet
            </div>
            <div className="text-[11px] text-slate-500 font-medium tracking-tight">
              Your Data. Your Rights.
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-700' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation & Decorative Promo Graphic */}
      <div className="p-4 space-y-3">
        <div className="space-y-1 border-t border-slate-100 pt-3">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
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

        {/* Bottom Graphic from Reference Screenshot */}
        <SidebarPromoGraphic />
      </div>
    </aside>
  );
};

