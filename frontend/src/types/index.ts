export interface Trip {
  id: number;
  user_id: number;
  vehicle_type: 'Petrol' | 'Diesel' | 'Hybrid' | 'EV';
  distance_km: number;
  duration_minutes: number;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  idle_minutes: number;
  idle_ratio: number;
  harsh_accel_count: number;
  harsh_brake_count: number;
  fuel_consumed_liters: number | null;
  energy_consumed_kwh: number | null;
  co2_emissions_kg: number;
  eco_score: number;
  score_smoothness: number;
  score_speed: number;
  score_idle: number;
  score_efficiency: number;
  score_drop_reasons: string[];
  source: 'manual' | 'csv';
  notes?: string | null;
  created_at: string;
}

export interface TripCreate {
  vehicle_type: string;
  distance_km: number;
  duration_minutes: number;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  idle_minutes: number;
  harsh_accel_count: number;
  harsh_brake_count: number;
  fuel_consumed_liters?: number | null;
  energy_consumed_kwh?: number | null;
  notes?: string | null;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  current_xp: number;
  level: number;
  level_title: string;
  xp_for_next_level: number;
  level_progress_percent: number;
  current_streak: number;
  best_streak: number;
  total_co2_saved_kg: number;
  total_distance_km: number;
  total_trips_count: number;
  average_eco_score: number;
}

export interface Badge {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  xp_reward: number;
  is_unlocked: boolean;
  awarded_at?: string | null;
}

export interface Challenge {
  id: number;
  code: string;
  title: string;
  description: string;
  category: string;
  target_type: string;
  target_value: number;
  current_progress: number;
  progress_percentage: number;
  reward_xp: number;
  badge_code?: string | null;
  icon: string;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  avatar_url?: string | null;
  level: number;
  level_title: string;
  current_xp: number;
  average_eco_score: number;
  badges_count: number;
  is_current_user: boolean;
  is_demo: boolean;
}

export interface MetricSummary {
  current_value: number;
  previous_value: number;
  change_percentage: number;
  unit: string;
  is_positive_good: boolean;
}

export interface DashboardData {
  user: UserProfile;
  current_eco_score: number;
  score_rating: string;
  score_breakdown: {
    smoothness: number;
    speed_efficiency: number;
    idle_efficiency: number;
    energy_efficiency: number;
  };
  total_co2_kg: number;
  total_distance_km: number;
  average_speed_kmh: number;
  idle_percentage: number;
  recent_trips: Trip[];
  active_challenges: Challenge[];
  weekly_trend: {
    date: string;
    full_date: string;
    score: number;
    has_trips: boolean;
    distance_km: number;
    co2_kg: number;
  }[];
  personalized_tip: string;
  eco_impact_statement: string;
}

export interface AnalyticsData {
  trips_trend: {
    id: number;
    date: string;
    full_timestamp: string;
    score: number;
    co2_kg: number;
    distance_km: number;
    idle_ratio_pct: number;
    vehicle_type: string;
    smoothness: number;
    efficiency: number;
  }[];
  metrics_comparison: {
    eco_score: MetricSummary;
    co2_emissions: MetricSummary;
    idle_percentage: MetricSummary;
    distance: MetricSummary;
  };
  vehicle_breakdown: Record<string, {
    trips_count: number;
    total_km: number;
    avg_score: number;
    total_co2_kg: number;
    co2_per_km: number;
  }>;
  smoothness_stats: {
    harsh_accelerations_total: number;
    harsh_braking_total: number;
    events_per_100km: number;
  };
}

export interface WeeklyInsightsData {
  week_start: string;
  week_end: string;
  trips_count: number;
  total_distance_km: number;
  total_co2_kg: number;
  average_eco_score: number;
  average_efficiency: number;
  score_change_vs_last_week: number;
  co2_change_vs_last_week: number;
  best_trip?: Trip | null;
  biggest_improvement_area: string;
  actionable_recommendations: {
    title: string;
    category: string;
    impact: string;
    tip: string;
  }[];
}

export interface EvIceComparisonData {
  distance_km: number;
  ice_petrol_co2_kg: number;
  ice_diesel_co2_kg: number;
  hybrid_co2_kg: number;
  ev_co2_kg: number;
  co2_savings_kg: number;
  co2_reduction_percentage: number;
  ice_cost_usd: number;
  ev_cost_usd: number;
  cost_savings_usd: number;
  assumptions: Record<string, string>;
}
