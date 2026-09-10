import React from 'react';
import { Target, CheckCircle2, Clock, Flame, Award, Leaf, Feather, Compass } from 'lucide-react';
import { Challenge } from '../../types';

interface ChallengeListProps {
  challenges: Challenge[];
}

export const ChallengeList: React.FC<ChallengeListProps> = ({ challenges }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Feather':
        return <Feather className="w-5 h-5 text-eco-400" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-purple-400" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-sky-400" />;
      default:
        return <Target className="w-5 h-5 text-eco-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {challenges.map((c) => (
        <div
          key={c.id}
          className={`p-5 rounded-xl border transition-all ${
            c.is_completed
              ? 'bg-slate-900/90 border-eco-500/40 shadow-sm shadow-eco-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0">
                {getIcon(c.icon)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-white">{c.title}</h4>
                  {c.is_completed && (
                    <span className="flex items-center text-[10px] text-eco-400 bg-eco-500/10 px-2 py-0.5 rounded-full border border-eco-500/30 font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{c.description}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 shrink-0 font-mono">
              +{c.reward_xp} XP
            </span>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>
                Progress: <strong className="text-white font-semibold">{c.current_progress}</strong> / {c.target_value}
              </span>
              <span className="text-eco-400 font-bold">{c.progress_percentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  c.is_completed ? 'bg-eco-400' : 'bg-eco-500'
                }`}
                style={{ width: `${Math.min(100, c.progress_percentage)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
