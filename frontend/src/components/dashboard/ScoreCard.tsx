import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  rating: string;
  breakdown: {
    smoothness: number;
    speed_efficiency: number;
    idle_efficiency: number;
    energy_efficiency: number;
  };
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, rating, breakdown }) => {
  const getRatingColor = (r: string) => {
    switch (r) {
      case 'Excellent':
        return 'text-eco-400 bg-eco-500/10 border-eco-500/30';
      case 'Good':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Fair':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const components = [
    { label: 'Smoothness (Throttle/Brakes)', value: breakdown.smoothness, weight: '30%' },
    { label: 'Idle Minimization', value: breakdown.idle_efficiency, weight: '25%' },
    { label: 'Speed Efficiency', value: breakdown.speed_efficiency, weight: '20%' },
    { label: 'Powertrain Energy Efficiency', value: breakdown.energy_efficiency, weight: '25%' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Composite Eco Score
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getRatingColor(rating)}`}>
            {rating}
          </span>
        </div>

        {/* Large Score Display */}
        <div className="flex items-baseline space-x-3 mb-6">
          <span className="text-5xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-slate-500 text-sm font-medium">/ 100 pts</span>
        </div>

        {/* Component breakdown progress bars */}
        <div className="space-y-3.5">
          {components.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">{c.label}</span>
                <span className="text-slate-400 font-mono">{c.value} / 100</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-eco-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${c.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start space-x-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p>Weighted combination of throttle smoothness, idle ratio, velocity aerodynamic profile, and class consumption baseline.</p>
      </div>
    </div>
  );
};
