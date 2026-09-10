import React from 'react';
import { ScoreCard } from '../components/dashboard/ScoreCard';
import { MetricsGrid } from '../components/dashboard/MetricsGrid';
import { WeeklyTrendChart } from '../components/dashboard/WeeklyTrendChart';
import { ActiveChallengesCard } from '../components/dashboard/ActiveChallengesCard';
import { RecentTripsTable } from '../components/dashboard/RecentTripsTable';
import { PersonalizedTipCard } from '../components/dashboard/PersonalizedTipCard';
import { DashboardData, Trip } from '../types';

interface DashboardPageProps {
  data: DashboardData;
  onSelectTrip: (trip: Trip) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  onSelectTrip,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <MetricsGrid
        totalDistance={data.total_distance_km}
        totalCo2={data.total_co2_kg}
        avgSpeed={data.average_speed_kmh}
        idlePercentage={data.idle_percentage}
        co2Saved={data.user.total_co2_saved_kg}
      />

      {/* Main Row: Composite Score Card & 7-Day Performance Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ScoreCard
            score={data.current_eco_score}
            rating={data.score_rating}
            breakdown={data.score_breakdown}
          />
        </div>
        <div className="lg:col-span-2">
          <WeeklyTrendChart data={data.weekly_trend} />
        </div>
      </div>

      {/* Actionable Coaching & Ecological Impact */}
      <PersonalizedTipCard
        tip={data.personalized_tip}
        impactStatement={data.eco_impact_statement}
      />

      {/* Bottom Row: Recent Trips & Active Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTripsTable
            trips={data.recent_trips}
            onSelectTrip={onSelectTrip}
            onViewAll={() => onNavigateTab('trips')}
          />
        </div>
        <div className="lg:col-span-1">
          <ActiveChallengesCard
            challenges={data.active_challenges}
            onViewAll={() => onNavigateTab('challenges')}
          />
        </div>
      </div>
    </div>
  );
};
