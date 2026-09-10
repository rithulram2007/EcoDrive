import axios from 'axios';
import {
  DashboardData,
  Trip,
  TripCreate,
  AnalyticsData,
  Challenge,
  Badge,
  LeaderboardEntry,
  WeeklyInsightsData,
  EvIceComparisonData,
  UserProfile
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get<DashboardData>('/api/dashboard');
  return data;
};

export const getTrips = async (params?: {
  vehicle_type?: string;
  min_score?: number;
  max_score?: number;
  limit?: number;
  offset?: number;
}): Promise<Trip[]> => {
  const { data } = await api.get<Trip[]>('/api/trips', { params });
  return data;
};

export const getTrip = async (id: number): Promise<Trip> => {
  const { data } = await api.get<Trip>(`/api/trips/${id}`);
  return data;
};

export const createTrip = async (trip: TripCreate): Promise<Trip> => {
  const { data } = await api.post<Trip>('/api/trips', trip);
  return data;
};

export const uploadTripCsv = async (formData: FormData): Promise<Trip> => {
  const { data } = await api.post<Trip>('/api/trips/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

export const getAnalytics = async (days = 30): Promise<AnalyticsData> => {
  const { data } = await api.get<AnalyticsData>('/api/analytics', { params: { days } });
  return data;
};

export const getChallenges = async (): Promise<Challenge[]> => {
  const { data } = await api.get<Challenge[]>('/api/challenges');
  return data;
};

export const getBadges = async (): Promise<Badge[]> => {
  const { data } = await api.get<Badge[]>('/api/badges');
  return data;
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data } = await api.get<LeaderboardEntry[]>('/api/leaderboard');
  return data;
};

export const getInsights = async (): Promise<WeeklyInsightsData> => {
  const { data } = await api.get<WeeklyInsightsData>('/api/insights');
  return data;
};

export const getComparison = async (distance_km = 25): Promise<EvIceComparisonData> => {
  const { data } = await api.get<EvIceComparisonData>('/api/compare', { params: { distance_km } });
  return data;
};

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get<UserProfile>('/api/profile');
  return data;
};
