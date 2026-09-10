import React, { useState, useEffect } from 'react';
import { WeeklyReportCard } from '../components/insights/WeeklyReportCard';
import { WeeklyInsightsData } from '../types';
import { getInsights } from '../services/api';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<WeeklyInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeeklyInsights = async () => {
    try {
      setLoading(true);
      const data = await getInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load weekly insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyInsights();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Generating weekly executive report...</div>;
  }

  if (!insights) {
    return <div className="py-24 text-center text-xs text-slate-500">Failed to generate insights.</div>;
  }

  return (
    <div className="space-y-6">
      <WeeklyReportCard insights={insights} />
    </div>
  );
};
