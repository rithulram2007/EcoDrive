import React, { useState, useEffect } from 'react';
import { ChallengeList } from '../components/gamification/ChallengeList';
import { BadgeGrid } from '../components/gamification/BadgeGrid';
import { Challenge, Badge } from '../types';
import { getChallenges, getBadges } from '../services/api';
import { Award, Target } from 'lucide-react';

export const ChallengesPage: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chalData, badgeData] = await Promise.all([getChallenges(), getBadges()]);
      setChallenges(chalData);
      setBadges(badgeData);
    } catch (err) {
      console.error('Failed to load challenges and badges', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading gamification engine...</div>;
  }

  const completedCount = challenges.filter((c) => c.is_completed).length;
  const unlockedBadges = badges.filter((b) => b.is_unlocked).length;

  return (
    <div className="space-y-8">
      {/* Challenges Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Target className="w-4 h-4 text-eco-400" />
              <span>Active Driving Challenges ({completedCount}/{challenges.length} completed)</span>
            </h3>
            <p className="text-xs text-slate-400">Accomplish goals through regular, smooth driving to earn XP</p>
          </div>
        </div>
        <ChallengeList challenges={challenges} />
      </div>

      {/* Badges Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Driver Badges & Achievements ({unlockedBadges}/{badges.length} unlocked)</span>
            </h3>
            <p className="text-xs text-slate-400">Persistent credentials awarded based on real telemetry milestones</p>
          </div>
        </div>
        <BadgeGrid badges={badges} />
      </div>
    </div>
  );
};
