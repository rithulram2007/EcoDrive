import React from 'react';
import { Plus, UploadCloud, Flame, Menu } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  user?: UserProfile;
  onOpenLogModal: () => void;
  onOpenUploadModal: () => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  user,
  onOpenLogModal,
  onOpenUploadModal,
  onOpenMobileMenu,
}) => {
  return (
    <header className="h-16 md:h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center space-x-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shrink-0"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="min-w-0">
          <h2 className="text-base sm:text-xl font-bold text-white tracking-tight truncate">{title}</h2>
          <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {user && (
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>
              <strong className="text-white font-semibold">{user.current_streak} Day</strong> Eco Streak
            </span>
          </div>
        )}

        <button
          onClick={onOpenUploadModal}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
          <span className="hidden sm:inline">Upload CSV</span>
          <span className="sm:hidden">Upload</span>
        </button>

        <button
          onClick={onOpenLogModal}
          className="flex items-center space-x-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-eco-500 hover:bg-eco-400 text-slate-950 text-xs font-semibold transition-all shadow-sm shadow-eco-500/20"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950" />
          <span className="hidden sm:inline">Log Trip</span>
          <span className="sm:hidden">Log</span>
        </button>
      </div>
    </header>
  );
};
