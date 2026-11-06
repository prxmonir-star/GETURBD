import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { TournamentProvider } from './context/TournamentContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { UserDashboard } from './components/home/UserDashboard';
import { TournamentsListView } from './components/tournament/TournamentsListView';
import { MyMatchesView } from './components/matches/MyMatchesView';
import { WalletView } from './components/wallet/WalletView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { ProfileView } from './components/profile/ProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TournamentDetailsModal } from './components/tournament/TournamentDetailsModal';
import { JoinConfirmationModal } from './components/tournament/JoinConfirmationModal';
import { DepositModal } from './components/wallet/DepositModal';
import { WithdrawModal } from './components/wallet/WithdrawModal';
import { AuthModal } from './components/auth/AuthModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { Tournament } from './types';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toasts, dismissToast } = useNotifications();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [confirmTournament, setConfirmTournament] = useState<Tournament | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectTournament = (t: Tournament) => {
    setSelectedTournament(t);
  };

  const handleQuickJoin = (t: Tournament) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setConfirmTournament(t);
  };

  const handleJoinFromDetails = (t: Tournament) => {
    setSelectedTournament(null);
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    setConfirmTournament(t);
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
      {/* PWA Offline Banner */}
      <OfflineIndicator />

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDeposit={() => setIsDepositOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-20 md:pb-12">
        {currentTab === 'home' && (
          <UserDashboard
            onSelectTournament={handleSelectTournament}
            onSelectTab={setCurrentTab}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'tournaments' && (
          <TournamentsListView
            onSelectTournament={handleSelectTournament}
            onQuickJoin={handleQuickJoin}
          />
        )}

        {currentTab === 'matches' && (
          <MyMatchesView
            onSelectTournament={handleSelectTournament}
            onExploreTournaments={() => setCurrentTab('tournaments')}
          />
        )}

        {currentTab === 'wallet' && (
          <WalletView
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />
        )}

        {currentTab === 'leaderboard' && <LeaderboardView />}

        {currentTab === 'profile' && (
          <ProfileView
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />
        )}

        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* MODALS */}
      <TournamentDetailsModal
        tournament={selectedTournament}
        onClose={() => setSelectedTournament(null)}
        onJoinClick={handleJoinFromDetails}
      />

      <JoinConfirmationModal
        tournament={confirmTournament}
        isOpen={Boolean(confirmTournament)}
        onClose={() => setConfirmTournament(null)}
        onOpenDeposit={() => {
          setConfirmTournament(null);
          setIsDepositOpen(true);
        }}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* TOAST ALERTS */}
      <div className="fixed top-20 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/50 text-red-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <strong className="block text-white font-bold">{toast.title}</strong>
              <p className="leading-snug mt-0.5">{toast.message}</p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <TournamentProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </TournamentProvider>
      </WalletProvider>
    </AuthProvider>
  );
}
