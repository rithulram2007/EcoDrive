import React from 'react';
import {
  LayoutDashboard,
  Route,
  BarChart3,
  Scale,
  Award,
  Trophy,
  Sparkles,
  Flame,
  Leaf,
  ChevronRight,
  X
} from 'lucide-react';
import { UserProfile } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: UserProfile;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'trips', label: 'Trips & Logs', icon: Route },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'compare', label: 'EV vs ICE', icon: Scale },
    { id: 'challenges', label: 'Challenges & Badges', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'insights', label: 'Weekly Insights', icon: Sparkles },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-eco-500/20 border border-eco-500/40 flex items-center justify-center text-eco-400">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                EcoDrive
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-eco-500/20 text-eco-400 font-mono font-medium">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Drive smarter. Waste less.</p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-eco-500 text-slate-950 font-semibold shadow-sm shadow-eco-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-slate-950" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Mini Profile & Gamification Stats */}
      {user && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center space-x-3 mb-3">
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user.name}
              className="w-10 h-10 rounded-full border border-slate-700 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-eco-400 flex items-center gap-1 font-medium">
                <span>Lvl {user.level}</span>
                <span className="text-slate-600">•</span>
                <span className="truncate">{user.level_title}</span>
              </p>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user.current_streak}d</span>
            </div>
          </div>

          {/* XP Level Progress Bar */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
              <span>{user.current_xp.toLocaleString()} XP</span>
              <span className="text-slate-300">
                {user.level >= 5
                  ? 'Max Tier Achieved'
                  : `${user.xp_for_next_level.toLocaleString()} XP`}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-eco-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, user.level >= 5 ? 100 : user.level_progress_percent)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col justify-between shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
