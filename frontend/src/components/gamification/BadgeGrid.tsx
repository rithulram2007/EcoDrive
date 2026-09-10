import React from 'react';
import { Flag, Feather, Clock, Zap, Leaf, Flame, Award, Lock, Check } from 'lucide-react';
import { Badge } from '../../types';

interface BadgeGridProps {
  badges: Badge[];
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
  const getBadgeIcon = (code: string) => {
    switch (code) {
      case 'first_trip':
        return <Flag className="w-6 h-6" />;
      case 'smooth_operator':
        return <Feather className="w-6 h-6" />;
      case 'idle_crusher':
        return <Clock className="w-6 h-6" />;
      case 'fuel_saver':
        return <Zap className="w-6 h-6" />;
      case 'low_carbon':
        return <Leaf className="w-6 h-6" />;
      case 'streak_7':
        return <Flame className="w-6 h-6" />;
      case 'eco_champion':
        return <Award className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {badges.map((b) => (
        <div
          key={b.id}
          className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
            b.is_unlocked
              ? 'bg-slate-900 border-eco-500/40 shadow-sm shadow-eco-500/10'
              : 'bg-slate-900/40 border-slate-800/80 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  b.is_unlocked
                    ? 'bg-eco-500/20 border-eco-500/40 text-eco-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {b.is_unlocked ? getBadgeIcon(b.code) : <Lock className="w-5 h-5 text-slate-500" />}
              </div>
              <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                +{b.xp_reward} XP
              </span>
            </div>

            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
              <span>{b.title}</span>
              {b.is_unlocked && <Check className="w-4 h-4 text-eco-400" />}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">{b.description}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 uppercase font-medium">{b.category}</span>
            {b.is_unlocked ? (
              <span className="text-eco-400 font-medium">Unlocked</span>
            ) : (
              <span className="text-slate-500">Locked</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
