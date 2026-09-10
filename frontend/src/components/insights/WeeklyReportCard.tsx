import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WeeklyInsightsData } from '../../types';

interface WeeklyReportCardProps {
  insights: WeeklyInsightsData;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({ insights }) => {
  return (
    <div className="space-y-6">
      {/* Executive Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-eco-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weekly Executive Report</span>
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Performance Review ({insights.week_start} – {insights.week_end})
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              <strong>{insights.trips_count}</strong> Trips Completed
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium font-mono">
              <strong>{insights.total_distance_km}</strong> km Driven
            </span>
          </div>
        </div>

        {/* Weekly Metric Comparisons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Weekly Eco Score</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white font-mono">{insights.average_eco_score}</span>
              <span className="text-slate-500 text-xs">/ 100</span>
            </div>
            <div className="flex items-center space-x-1 mt-1.5 text-xs font-semibold">
              {insights.score_change_vs_last_week >= 0 ? (
                <span className="text-eco-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{insights.score_change_vs_last_week} pts
                </span>
              ) : (
                <span className="text-rose-400 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {insights.score_change_vs_last_week} pts
                </span>
              )}
              <span className="text-slate-500 font-normal">vs last week</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Total Carbon Output</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white font-mono">{insights.total_co2_kg}</span>
              <span className="text-slate-500 text-xs">kg CO₂</span>
            </div>
            <div className="flex items-center space-x-1 mt-1.5 text-xs font-semibold">
              {insights.co2_change_vs_last_week <= 0 ? (
                <span className="text-eco-400 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {insights.co2_change_vs_last_week} kg
                </span>
              ) : (
                <span className="text-amber-400 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{insights.co2_change_vs_last_week} kg
                </span>
              )}
              <span className="text-slate-500 font-normal">vs last week</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Carbon Intensity</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white font-mono">{insights.average_efficiency}</span>
              <span className="text-slate-500 text-xs">kg/100km</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">Weighted avg per 100km</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-850 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Primary Growth Area</span>
            <p className="text-sm font-bold text-amber-400 mt-1 truncate">
              {insights.biggest_improvement_area}
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5">Focus for the upcoming week</p>
          </div>
        </div>

        {/* Best Trip Spotlight */}
        {insights.best_trip && (
          <div className="mt-5 p-4 bg-eco-950/20 border border-eco-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-eco-500/20 text-eco-400">
                <Star className="w-5 h-5 fill-eco-400" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-eco-400 uppercase tracking-wider">
                  Weekly Best Trip Benchmark
                </span>
                <p className="text-sm font-bold text-white">
                  {insights.best_trip.notes || `${insights.best_trip.distance_km} km journey`} •{' '}
                  <span className="font-mono text-eco-400 font-bold">{insights.best_trip.eco_score} pts</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-300">
              <span>{insights.best_trip.distance_km} km</span>
              <span>{insights.best_trip.co2_emissions_kg} kg CO₂</span>
              <span>{insights.best_trip.vehicle_type}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actionable Recommendations List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-eco-400" />
          <span>Targeted Actionable Eco-Driving Tips</span>
        </h3>

        <div className="space-y-3">
          {insights.actionable_recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-850 rounded-lg border border-slate-800 flex items-start space-x-3.5"
            >
              <div className="w-6 h-6 rounded-full bg-eco-500/10 border border-eco-500/30 flex items-center justify-center text-eco-400 shrink-0 font-bold text-xs">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-200">{rec.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-400 border border-slate-700">
                    {rec.category}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      rec.impact === 'High'
                        ? 'text-rose-400 bg-rose-500/10'
                        : rec.impact === 'Medium'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-eco-400 bg-eco-500/10'
                    }`}
                  >
                    {rec.impact} Impact
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{rec.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
