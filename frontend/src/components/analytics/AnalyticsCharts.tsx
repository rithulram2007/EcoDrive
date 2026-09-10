import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, Gauge, Zap } from 'lucide-react';
import { AnalyticsData, MetricSummary } from '../../types';

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<'score' | 'co2' | 'idle' | 'distance'>('score');

  const renderDeltaBadge = (summary: MetricSummary) => {
    const isGood = summary.change_percentage === 0
      ? true
      : summary.is_positive_good
      ? summary.change_percentage > 0
      : summary.change_percentage < 0;

    const Icon = summary.change_percentage > 0
      ? TrendingUp
      : summary.change_percentage < 0
      ? TrendingDown
      : Minus;

    const colorClass = isGood
      ? 'text-eco-400 bg-eco-500/10 border-eco-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

    const sign = summary.change_percentage > 0 ? '+' : '';

    return (
      <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>
          {sign}{summary.change_percentage}%
        </span>
      </div>
    );
  };

  const metricCards = [
    {
      id: 'score',
      label: 'Eco Score',
      summary: data.metrics_comparison.eco_score,
      val: `${data.metrics_comparison.eco_score.current_value} pts`,
      sub: 'Last 7 days avg',
    },
    {
      id: 'co2',
      label: 'CO₂ Emissions',
      summary: data.metrics_comparison.co2_emissions,
      val: `${data.metrics_comparison.co2_emissions.current_value} kg`,
      sub: 'Last 7 days total',
    },
    {
      id: 'idle',
      label: 'Idle Time',
      summary: data.metrics_comparison.idle_percentage,
      val: `${data.metrics_comparison.idle_percentage.current_value}%`,
      sub: 'Stationary ratio',
    },
    {
      id: 'distance',
      label: 'Distance Driven',
      summary: data.metrics_comparison.distance,
      val: `${data.metrics_comparison.distance.current_value} km`,
      sub: 'Last 7 days total',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Week-over-Week KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <div
            key={m.id}
            onClick={() => setSelectedMetric(m.id as any)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedMetric === m.id
                ? 'bg-slate-900 border-eco-500 shadow-sm shadow-eco-500/10'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{m.label}</span>
              {renderDeltaBadge(m.summary)}
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{m.val}</p>
            <p className="text-[11px] text-slate-500 mt-1">vs prior 7 days ({m.summary.previous_value} {m.summary.unit})</p>
          </div>
        ))}
      </div>

      {/* Main Historical Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Historical Telemetry Trends</h3>
            <p className="text-xs text-slate-400">Chronological analysis of each trip logged</p>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setSelectedMetric('score')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedMetric === 'score' ? 'bg-eco-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Eco Score
            </button>
            <button
              onClick={() => setSelectedMetric('co2')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedMetric === 'co2' ? 'bg-eco-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              CO₂ (kg)
            </button>
            <button
              onClick={() => setSelectedMetric('idle')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedMetric === 'idle' ? 'bg-eco-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Idle %
            </button>
            <button
              onClick={() => setSelectedMetric('distance')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                selectedMetric === 'distance' ? 'bg-eco-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Distance (km)
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === 'score' ? (
              <LineChart data={data.trips_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} pts`, 'Eco Score']}
                />
                <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 3 }} />
              </LineChart>
            ) : selectedMetric === 'co2' ? (
              <BarChart data={data.trips_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} kg`, 'CO₂ Emissions']}
                />
                <Bar dataKey="co2_kg" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : selectedMetric === 'idle' ? (
              <LineChart data={data.trips_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 40]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Idle Percentage']}
                />
                <Line type="monotone" dataKey="idle_ratio_pct" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 3 }} />
              </LineChart>
            ) : (
              <BarChart data={data.trips_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} km`, 'Distance Traveled']}
                />
                <Bar dataKey="distance_km" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Powertrain Breakdown Table & Smoothness Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Powertrain Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-white mb-4">Powertrain Efficiency Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                  <th className="pb-2.5">Powertrain</th>
                  <th className="pb-2.5">Trips</th>
                  <th className="pb-2.5">Total Distance</th>
                  <th className="pb-2.5">Avg Score</th>
                  <th className="pb-2.5">Total CO₂</th>
                  <th className="pb-2.5 text-right">Intensity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(data.vehicle_breakdown).map(([vType, stats]) => (
                  <tr key={vType} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-semibold text-white">{vType}</td>
                    <td className="py-2.5 text-slate-300 font-mono">{stats.trips_count}</td>
                    <td className="py-2.5 text-slate-300 font-mono">{stats.total_km} km</td>
                    <td className="py-2.5">
                      <span className="font-bold text-eco-400 font-mono">{stats.avg_score}</span>
                    </td>
                    <td className="py-2.5 text-slate-300 font-mono">{stats.total_co2_kg} kg</td>
                    <td className="py-2.5 text-right font-mono text-slate-300">
                      {stats.co2_per_km} kg/km
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Smoothness & Harsh Event Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Smoothness Index</h3>
            <p className="text-xs text-slate-400 mb-4">Aggregate throttle and brake stability</p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Harsh Accelerations</span>
                <span className="text-xl font-bold text-white font-mono">
                  {data.smoothness_stats.harsh_accelerations_total}
                </span>
                <span className="text-[10px] text-slate-500 block">Events exceeding +2.5 m/s²</span>
              </div>

              <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Harsh Braking Events</span>
                <span className="text-xl font-bold text-white font-mono">
                  {data.smoothness_stats.harsh_braking_total}
                </span>
                <span className="text-[10px] text-slate-500 block">Events exceeding -2.8 m/s²</span>
              </div>

              <div className="p-3 bg-slate-850 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 block">Harsh Events Rate</span>
                <span className="text-xl font-bold text-eco-400 font-mono">
                  {data.smoothness_stats.events_per_100km} / 100km
                </span>
                <span className="text-[10px] text-slate-500 block">Industry target: &lt; 2.5 / 100km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
