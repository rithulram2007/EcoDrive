import React, { useState, useEffect } from 'react';
import { Route, Filter, Plus, UploadCloud, ArrowUpDown } from 'lucide-react';
import { Trip } from '../types';
import { getTrips } from '../services/api';

interface TripsPageProps {
  onSelectTrip: (trip: Trip) => void;
  onOpenLogModal: () => void;
  onOpenUploadModal: () => void;
}

export const TripsPage: React.FC<TripsPageProps> = ({
  onSelectTrip,
  onOpenLogModal,
  onOpenUploadModal,
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<string>('All');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchTripsList = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (vehicleFilter !== 'All') params.vehicle_type = vehicleFilter;
      if (minScoreFilter > 0) params.min_score = minScoreFilter;
      const data = await getTrips(params);
      setTrips(data);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripsList();
  }, [vehicleFilter, minScoreFilter]);

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
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-eco-400" />
            <span>Powertrain:</span>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700/60 text-xs">
            {['All', 'Petrol', 'Diesel', 'Hybrid', 'EV'].map((type) => (
              <button
                key={type}
                onClick={() => setVehicleFilter(type)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  vehicleFilter === type
                    ? 'bg-eco-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 ml-2">
            <span>Min Score:</span>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none focus:border-eco-500"
            >
              <option value="0">All Scores</option>
              <option value="70">70+ (Good)</option>
              <option value="80">80+ (High)</option>
              <option value="90">90+ (Elite)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenUploadModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
          >
            <UploadCloud className="w-4 h-4 text-slate-300" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={onOpenLogModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-eco-500 hover:bg-eco-400 text-slate-950 text-xs font-semibold transition-all shadow-sm shadow-eco-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Log Trip</span>
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">All Driving Journeys ({trips.length})</h3>
            <p className="text-xs text-slate-400">Click any journey for deep telemetry and score attribution</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No driving trips matching your current filter. Try resetting or logging a new trip.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                  <th className="pb-3">Date & Description</th>
                  <th className="pb-3">Powertrain</th>
                  <th className="pb-3">Distance</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Avg Speed</th>
                  <th className="pb-3">Idle Time</th>
                  <th className="pb-3">CO₂ Emissions</th>
                  <th className="pb-3 text-right">Eco Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trips.map((t) => {
                  const tripDate = new Date(t.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTrip(t)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-200 group-hover:text-eco-400 transition-colors">
                          {tripDate}
                        </p>
                        <p
                          title={t.notes || `${t.duration_minutes} min journey`}
                          className="text-[11px] text-slate-500 truncate max-w-[200px]"
                        >
                          {t.notes || `${t.duration_minutes} min journey`}
                        </p>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getVehicleBadge(
                            t.vehicle_type
                          )}`}
                        >
                          {t.vehicle_type}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-300 font-mono">{t.distance_km} km</td>
                      <td className="py-3.5 text-slate-300 font-mono">{t.duration_minutes} min</td>
                      <td className="py-3.5 text-slate-300 font-mono">{t.avg_speed_kmh} km/h</td>
                      <td className="py-3.5 text-slate-300 font-mono">
                        {t.idle_minutes} min ({Math.round(t.idle_ratio * 100)}%)
                      </td>
                      <td className="py-3.5 text-slate-300 font-mono">{t.co2_emissions_kg} kg</td>
                      <td className="py-3.5 text-right">
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
        )}
      </div>
    </div>
  );
};
