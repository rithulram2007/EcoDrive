import React from 'react';
import { Trophy, Medal, Award, UserCheck, Shield } from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries }) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold text-xs">
            1
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-400/20 border border-slate-400/50 flex items-center justify-center text-slate-300 font-bold text-xs">
            2
          </div>
        );
      case 3:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-700/20 border border-amber-700/50 flex items-center justify-center text-amber-600 font-bold text-xs">
            3
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 flex items-center justify-center text-slate-400 font-semibold text-xs font-mono">
            {rank}
          </div>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Driver XP Leaderboard</span>
          </h3>
          <p className="text-xs text-slate-400">
            Drivers ranked by accumulated eco-experience points and driving consistency
          </p>
        </div>
        <div className="flex flex-col sm:items-end text-right">
          <span className="text-[11px] px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Sample community data shown for demonstration purposes
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Rankings reset weekly • Transparent scoring
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
              <th className="pb-3 w-12 text-center">Rank</th>
              <th className="pb-3">Driver Profile</th>
              <th className="pb-3">Driver Tier</th>
              <th className="pb-3">Badges</th>
              <th className="pb-3">Avg Score</th>
              <th className="pb-3 text-right">Total XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {entries.map((entry) => {
              const isCurrentUser = entry.is_current_user;
              return (
                <tr
                  key={entry.user_id}
                  className={`transition-colors ${
                    isCurrentUser
                      ? 'bg-eco-500/10 hover:bg-eco-500/15 border-l-2 border-l-eco-500'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 text-center">{getRankBadge(entry.rank)}</td>
                  <td className="py-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          entry.avatar_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                        }
                        alt={entry.name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${isCurrentUser ? 'text-eco-400' : 'text-white'}`}>
                            {entry.name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-eco-500 text-slate-950 font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      Lvl {entry.level} • {entry.level_title}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-mono">
                    <div className="flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>{entry.badges_count}</span>
                    </div>
                  </td>
                  <td className="py-3 font-mono">
                    <span
                      className={`font-bold ${
                        entry.average_eco_score >= 80 ? 'text-eco-400' : 'text-slate-300'
                      }`}
                    >
                      {entry.average_eco_score} pts
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {entry.current_xp.toLocaleString()} XP
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
