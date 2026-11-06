import React from 'react';
import { Tournament } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useTournaments } from '../../context/TournamentContext';
import { TournamentCard } from '../tournament/TournamentCard';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { storage } from '../../services/storage';
import { 
  Trophy, 
  Swords, 
  Flame, 
  Plus, 
  ArrowDownRight, 
  Crosshair, 
  Sparkles, 
  Megaphone,
  Gamepad2,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

interface Props {
  onSelectTournament: (t: Tournament) => void;
  onSelectTab: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAuth: () => void;
}

export const UserDashboard: React.FC<Props> = ({
  onSelectTournament,
  onSelectTab,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { balance } = useWallet();
  const { tournaments } = useTournaments();
  const settings = storage.getSettings();

  const liveTournaments = tournaments.filter(t => t.status === 'LIVE');
  const upcomingTournaments = tournaments.filter(t => t.status === 'OPEN' || t.status === 'UPCOMING');
  const featuredTournament = tournaments.find(t => t.status === 'OPEN') || (tournaments.length > 0 ? tournaments[0] : null);

  // REAL STATS ONLY - Never use fake hardcoded numbers
  const userStats = user?.stats || { matches_played: 0, wins: 0, kills: 0, total_earnings: 0 };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Platform Announcements Ticker */}
      {settings.announcement_banner && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-red-950/40 via-purple-950/40 to-slate-900 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-200 shadow-md">
          <Megaphone className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="font-semibold truncate">{settings.announcement_banner}</span>
        </div>
      )}

      {/* Hero Esports Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#121520] to-[#0a0c12] border border-rose-950/80 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-purple-900/10 to-transparent" />
        <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-wider uppercase">
              <Flame className="w-3.5 h-3.5 fill-rose-500" />
              <span>Official Free Fire Esports Bangladesh</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              COMPETE. WIN. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-purple-500">
                EARN REAL CASH.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real custom rooms verified by tournament administrators. Join Solo, Duo, and Squad matches with instant payouts to Nagad.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {featuredTournament ? (
                <button
                  onClick={() => onSelectTournament(featuredTournament)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-rose-950/60 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  Join {featuredTournament.title} (৳{featuredTournament.entry_fee})
                </button>
              ) : isAdmin ? (
                <button
                  onClick={() => onSelectTab('admin')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Tournament (Admin)
                </button>
              ) : (
                <button
                  onClick={() => onSelectTab('tournaments')}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase border border-slate-700 transition flex items-center gap-2"
                >
                  <Swords className="w-4 h-4 text-rose-500" />
                  View Tournaments Lobby
                </button>
              )}

              <PWAInstallButton variant="hero" />
            </div>
          </div>

          {/* Quick Wallet & User Stats Widget */}
          <div className="w-full lg:w-80 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl shrink-0 backdrop-blur-md">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user?.avatar_url}
                      alt={user?.ff_name}
                      className="w-10 h-10 rounded-xl object-cover border border-rose-500/40"
                    />
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">{user?.ff_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">UID: {user?.ff_uid}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isAdmin ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {isAdmin ? '🛡️ Admin' : 'Player'}
                  </span>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 font-semibold mb-0.5">Verified Wallet Balance</div>
                  <div className="text-2xl font-black text-white flex items-baseline gap-1">
                    <span className="text-rose-500">৳</span>
                    <span>{balance.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 font-normal ml-1">BDT</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={onOpenDeposit}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Money
                  </button>
                  <button
                    onClick={onOpenWithdraw}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Withdraw
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Join Bangladesh FF Esports</h4>
                  <p className="text-xs text-slate-400 mt-1">Official Free Fire Custom Tournaments & Prize Payouts</p>
                </div>
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold tracking-wider uppercase transition shadow-md"
                >
                  Create Account / Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Career Quick Statistics - Real Verified Records Only */}
      {isAuthenticated && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800/80 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Matches</span>
              <span className="text-lg font-black text-white">{userStats.matches_played}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800/80 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Wins / Booyahs</span>
              <span className="text-lg font-black text-white">{userStats.wins}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800/80 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Kills</span>
              <span className="text-lg font-black text-white">{userStats.kills}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800/80 flex items-center gap-3 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Earned</span>
              <span className="text-lg font-black text-emerald-400">৳ {userStats.total_earnings}</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Tournaments Section (Only shown if admin has live matches) */}
      {liveTournaments.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h2 className="text-lg font-black text-white tracking-wide uppercase">
                Live Tournaments Happening Now
              </h2>
            </div>
            <span className="text-xs text-rose-400 font-bold">
              {liveTournaments.length} Active Match
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onSelect={onSelectTournament}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Tournaments Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-wide uppercase">
              Upcoming Tournaments
            </h2>
            <p className="text-xs text-slate-400">
              {upcomingTournaments.length > 0
                ? 'Reserve your slot before registrations close'
                : 'Real tournaments created by authorized administrators'}
            </p>
          </div>
          {upcomingTournaments.length > 0 && (
            <button
              onClick={() => onSelectTab('tournaments')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <span>&rarr;</span>
            </button>
          )}
        </div>

        {upcomingTournaments.length === 0 ? (
          /* EMPTY STATE AS REQUIRED BY USER */
          <div className="p-10 sm:p-14 text-center rounded-2xl bg-[#121520] border border-slate-800/80 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Swords className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white">No Tournament Available</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Admin has not created any tournament yet.
            </p>
            {isAdmin && (
              <button
                onClick={() => onSelectTab('admin')}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Match as Admin</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcomingTournaments.slice(0, 6).map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onSelect={onSelectTournament}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
