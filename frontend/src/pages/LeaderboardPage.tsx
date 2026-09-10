import React, { useState, useEffect } from 'react';
import { LeaderboardTable } from '../components/gamification/LeaderboardTable';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../services/api';

export const LeaderboardPage: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading leaderboard rankings...</div>;
  }

  return (
    <div className="space-y-6">
      <LeaderboardTable entries={entries} />
    </div>
  );
};
