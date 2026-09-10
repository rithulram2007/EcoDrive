import React from 'react';
import { Target, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { Challenge } from '../../types';

interface ActiveChallengesCardProps {
  challenges: Challenge[];
  onViewAll: () => void;
}

export const ActiveChallengesCard: React.FC<ActiveChallengesCardProps> = ({
  challenges,
  onViewAll,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-eco-400" />
          <h3 className="text-sm font-semibold text-white">Active Eco Challenges</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-eco-400 hover:text-eco-300 font-medium flex items-center space-x-1"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3.5">
        {challenges.map((c) => (
          <div
            key={c.id}
            className="p-3 bg-slate-850/60 border border-slate-800 rounded-lg hover:border-slate-700/80 transition-all"
          >
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-semibold text-slate-200">{c.title}</h4>
                  {c.is_completed && (
                    <span className="flex items-center text-[10px] text-eco-400 bg-eco-500/10 px-1.5 py-0.5 rounded border border-eco-500/30 font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>
              </div>
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                +{c.reward_xp} XP
              </span>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>
                  {c.current_progress} / {c.target_value}
                </span>
                <span>{c.progress_percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    c.is_completed ? 'bg-eco-400' : 'bg-eco-500'
                  }`}
                  style={{ width: `${Math.min(100, c.progress_percentage)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
