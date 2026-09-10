import React from 'react';
import { Route, CloudFog, Gauge, Clock, Sparkles } from 'lucide-react';

interface MetricsGridProps {
  totalDistance: number;
  totalCo2: number;
  avgSpeed: number;
  idlePercentage: number;
  co2Saved: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  totalDistance,
  totalCo2,
  avgSpeed,
  idlePercentage,
  co2Saved,
}) => {
  const cards = [
    {
      label: 'Total Distance',
      value: `${totalDistance.toLocaleString()} km`,
      sub: 'All recorded journeys',
      icon: Route,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Estimated CO₂',
      value: `${totalCo2.toLocaleString()} kg`,
      sub: 'Lifecycle tailpipe + grid',
      icon: CloudFog,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Average Speed',
      value: `${avgSpeed} km/h`,
      sub: 'Across mixed driving',
      icon: Gauge,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Stationary Idle',
      value: `${idlePercentage}%`,
      sub: 'Target: below 5%',
      icon: Clock,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'CO₂ Prevented',
      value: `${co2Saved} kg`,
      sub: 'vs unoptimized baseline',
      icon: Sparkles,
      color: 'text-eco-400 bg-eco-500/10 border-eco-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{c.label}</span>
              <div className={`p-1.5 rounded-lg border ${c.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight">{c.value}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{c.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
