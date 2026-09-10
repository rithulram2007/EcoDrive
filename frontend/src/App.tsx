import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { TripsPage } from './pages/TripsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EvIceComparePage } from './pages/EvIceComparePage';
import { ChallengesPage } from './pages/ChallengesPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { InsightsPage } from './pages/InsightsPage';
import { TripDetailModal } from './components/trips/TripDetailModal';
import { ManualTripFormModal } from './components/trips/ManualTripFormModal';
import { CsvUploadModal } from './components/trips/CsvUploadModal';
import { getDashboard } from './services/api';
import { DashboardData, Trip } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & responsive drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to connect to EcoDrive API. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTripCreatedOrUploaded = () => {
    fetchDashboardData();
  };

  const getPageTitleAndSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'EcoDrive Dashboard',
          subtitle: 'Real-time efficiency telemetry, carbon impact, and personal coaching',
        };
      case 'trips':
        return {
          title: 'Driving Journeys & Logs',
          subtitle: 'Audit individual trip telemetries, powertrain outputs, and score deductions',
        };
      case 'analytics':
        return {
          title: 'Historical Driving Analytics',
          subtitle: 'Track score trajectories, week-over-week deltas, and smoothness indices',
        };
      case 'compare':
        return {
          title: 'EV vs. ICE Powertrain Modeling',
          subtitle: 'Simulate carbon reduction and energy expenditure across vehicle platforms',
        };
      case 'challenges':
        return {
          title: 'Challenges & Driver Badges',
          subtitle: 'Gamified eco-driving milestones and persistent telemetry credentials',
        };
      case 'leaderboard':
        return {
          title: 'Community Leaderboard',
          subtitle: 'Top drivers ranked by accumulated eco-XP and driving consistency',
        };
      case 'insights':
        return {
          title: 'Weekly Performance Review',
          subtitle: 'Comprehensive executive analysis, best journey spotlight, and tailored coaching',
        };
      default:
        return {
          title: 'EcoDrive',
          subtitle: 'Drive smarter. Waste less.',
        };
    }
  };

  const { title, subtitle } = getPageTitleAndSubtitle();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-eco-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={dashboardData?.user}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          user={dashboardData?.user}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {error ? (
            <div className="max-w-md mx-auto my-24 p-6 bg-slate-900 border border-rose-500/30 rounded-2xl text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3 font-bold">
                !
              </div>
              <h3 className="text-base font-bold text-white mb-1">Backend Connection Error</h3>
              <p className="text-xs text-slate-400 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 rounded-lg bg-eco-500 text-slate-950 text-xs font-semibold hover:bg-eco-400 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : loading && !dashboardData ? (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-eco-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Initializing EcoDrive Intelligence Engine...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto pb-12">
              {activeTab === 'dashboard' && dashboardData && (
                <DashboardPage
                  data={dashboardData}
                  onSelectTrip={(t) => setSelectedTrip(t)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}
              {activeTab === 'trips' && (
                <TripsPage
                  onSelectTrip={(t) => setSelectedTrip(t)}
                  onOpenLogModal={() => setIsLogModalOpen(true)}
                  onOpenUploadModal={() => setIsUploadModalOpen(true)}
                />
              )}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'compare' && <EvIceComparePage />}
              {activeTab === 'challenges' && <ChallengesPage />}
              {activeTab === 'leaderboard' && <LeaderboardPage />}
              {activeTab === 'insights' && <InsightsPage />}
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <TripDetailModal
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />

      <ManualTripFormModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onTripCreated={handleTripCreatedOrUploaded}
      />

      <CsvUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onTripUploaded={handleTripCreatedOrUploaded}
      />
    </div>
  );
}

export default App;
