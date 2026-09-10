import React from 'react';
import { X, Gauge, Clock, CloudFog, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { Trip } from '../../types';

interface TripDetailModalProps {
  trip: Trip | null;
  onClose: () => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({ trip, onClose }) => {
  if (!trip) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-eco-400 bg-eco-500/10 border-eco-500/30';
    if (score >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const formattedDate = new Date(trip.created_at).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Trip #{trip.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-eco-500/10 text-eco-400 border border-eco-500/30">
                {trip.vehicle_type}
              </span>
              <span className="text-xs text-slate-500 uppercase">{trip.source}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {trip.notes || 'Driving Journey Analysis'}
            </h3>
            <p className="text-xs text-slate-400">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Rating Bar */}
        <div className="my-5 p-5 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Calculated Eco Score
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-4xl font-extrabold text-white">{trip.eco_score}</span>
              <span className="text-slate-500 text-xs font-mono">/ 100</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(trip.eco_score)}`}>
              {trip.eco_score >= 85 ? 'Excellent' : trip.eco_score >= 70 ? 'Good' : trip.eco_score >= 55 ? 'Fair' : 'Needs Improvement'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 font-mono">
              Emissions: {trip.co2_emissions_kg} kg CO₂
            </span>
          </div>
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Smoothness</span>
            <span className="text-base font-bold text-white">{trip.score_smoothness}</span>
            <span className="text-[10px] text-slate-500 block">30% weight</span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Idle Score</span>
            <span className="text-base font-bold text-white">{trip.score_idle}</span>
            <span className="text-[10px] text-slate-500 block">25% weight</span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Speed Efficiency</span>
            <span className="text-base font-bold text-white">{trip.score_speed}</span>
            <span className="text-[10px] text-slate-500 block">20% weight</span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-1">Energy Efficiency</span>
            <span className="text-base font-bold text-white">{trip.score_efficiency}</span>
            <span className="text-[10px] text-slate-500 block">25% weight</span>
          </div>
        </div>

        {/* Detailed Telemetry Grid */}
        <div className="border border-slate-800 rounded-xl p-4 mb-5">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Detailed Journey Telemetry
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-slate-500 block">Distance Traveled</span>
              <span className="font-semibold text-white font-mono">{trip.distance_km} km</span>
            </div>
            <div>
              <span className="text-slate-500 block">Duration</span>
              <span className="font-semibold text-white font-mono">{trip.duration_minutes} mins</span>
            </div>
            <div>
              <span className="text-slate-500 block">Average Speed</span>
              <span className="font-semibold text-white font-mono">{trip.avg_speed_kmh} km/h</span>
            </div>
            <div>
              <span className="text-slate-500 block">Peak Speed</span>
              <span className="font-semibold text-white font-mono">{trip.max_speed_kmh} km/h</span>
            </div>
            <div>
              <span className="text-slate-500 block">Stationary Idle Time</span>
              <span className="font-semibold text-white font-mono">
                {trip.idle_minutes} mins ({Math.round(trip.idle_ratio * 100)}%)
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Aggressive Accelerations</span>
              <span className={`font-semibold font-mono ${trip.harsh_accel_count > 0 ? 'text-rose-400' : 'text-eco-400'}`}>
                {trip.harsh_accel_count} events
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Hard Braking Events</span>
              <span className={`font-semibold font-mono ${trip.harsh_brake_count > 0 ? 'text-rose-400' : 'text-eco-400'}`}>
                {trip.harsh_brake_count} events
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Consumption</span>
              <span className="font-semibold text-white font-mono">
                {trip.fuel_consumed_liters !== null
                  ? `${trip.fuel_consumed_liters} L (${((trip.fuel_consumed_liters / trip.distance_km) * 100).toFixed(1)} L/100km)`
                  : trip.energy_consumed_kwh !== null
                  ? `${trip.energy_consumed_kwh} kWh (${((trip.energy_consumed_kwh / trip.distance_km) * 100).toFixed(1)} kWh/100km)`
                  : 'Class estimated'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Carbon Footprint</span>
              <span className="font-semibold text-eco-400 font-mono">
                {trip.co2_emissions_kg} kg CO₂
              </span>
            </div>
          </div>
        </div>

        {/* Transparent Score Deductions Explanation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Transparent Score Attribution</span>
          </h4>
          <ul className="space-y-1.5 text-xs">
            {trip.score_drop_reasons && trip.score_drop_reasons.length > 0 ? (
              trip.score_drop_reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-300">
                  <span className="text-slate-500 select-none">•</span>
                  <span>{reason}</span>
                </li>
              ))
            ) : (
              <li className="text-eco-400 flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Zero deductions: Exceptional efficiency profile throughout the entire journey.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
