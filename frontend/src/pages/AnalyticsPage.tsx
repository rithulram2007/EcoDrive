import React, { useState, useEffect } from 'react';
import { AnalyticsCharts } from '../components/analytics/AnalyticsCharts';
import { AnalyticsData } from '../types';
import { getAnalytics } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedDays: number) => {
    try {
      setLoading(true);
      const data = await getAnalytics(selectedDays);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Driving Analytics Scope</h3>
          <p className="text-xs text-slate-400">Filter trend intervals for historical comparisons</p>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700/60 text-xs">
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                days === d
                  ? 'bg-eco-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-500">Loading analytics models...</div>
      ) : analytics ? (
        <AnalyticsCharts data={analytics} />
      ) : (
        <div className="py-24 text-center text-xs text-slate-500">Failed to load analytics.</div>
      )}
    </div>
  );
};
