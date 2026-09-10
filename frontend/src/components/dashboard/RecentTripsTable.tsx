import React from 'react';
import { Route, ChevronRight, Zap, Fuel } from 'lucide-react';
import { Trip } from '../../types';

interface RecentTripsTableProps {
  trips: Trip[];
  onSelectTrip: (trip: Trip) => void;
  onViewAll: () => void;
}

export const RecentTripsTable: React.FC<RecentTripsTableProps> = ({
  trips,
  onSelectTrip,
  onViewAll,
}) => {
  const getVehicleBadge = (type: string) => {
    switch (type) {
      case 'EV':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Hybrid':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'Diesel':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'text-eco-400 bg-eco-500/10 border-eco-500/30';
    if (score >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Route className="w-4 h-4 text-eco-400" />
          <h3 className="text-sm font-semibold text-white">Recent Driving Trips</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-eco-400 hover:text-eco-300 font-medium flex items-center space-x-1"
        >
          <span>View All Trips</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
              <th className="pb-2.5">Date & Route</th>
              <th className="pb-2.5">Powertrain</th>
              <th className="pb-2.5">Distance</th>
              <th className="pb-2.5">CO₂ Emissions</th>
              <th className="pb-2.5 text-right">Eco Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {trips.map((t) => {
              const tripDate = new Date(t.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTrip(t)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3">
                    <p className="font-semibold text-slate-200 group-hover:text-eco-400 transition-colors">
                      {tripDate}
                    </p>
                    <p
                      title={t.notes || `${t.duration_minutes} min journey`}
                      className="text-[11px] text-slate-500 truncate max-w-[160px]"
                    >
                      {t.notes || `${t.duration_minutes} min journey`}
                    </p>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getVehicleBadge(
                        t.vehicle_type
                      )}`}
                    >
                      {t.vehicle_type}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-mono">{t.distance_km} km</td>
                  <td className="py-3 text-slate-300 font-mono">{t.co2_emissions_kg} kg</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreBadge(
                        t.eco_score
                      )}`}
                    >
                      {t.eco_score}
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
