import React, { useState } from 'react';
import { 
  Tournament, 
  Profile, 
  DepositRequest, 
  WithdrawalRequest, 
  Transaction, 
  AdminLog, 
  AppSettings,
  MatchType,
  GameMap,
  GameMode,
  TournamentStatus
} from '../../types';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Swords, 
  ArrowDownRight, 
  ArrowUpRight, 
  Award, 
  Bell, 
  Receipt, 
  History, 
  Settings as SettingsIcon,
  Check, 
  X, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Key, 
  Send, 
  Ban, 
  CheckCircle, 
  AlertTriangle,
  PlayCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, allProfiles, refreshUser } = useAuth();
  const { tournaments, refreshTournaments, participants } = useTournaments();
  const { showToast } = useNotifications();

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'tournaments'
    | 'matches'
    | 'deposits'
    | 'withdrawals'
    | 'winners'
    | 'leaderboard'
    | 'notifications'
    | 'transactions'
    | 'logs'
    | 'settings'
  >('dashboard');

  // Search and state helpers
  const [userSearch, setUserSearch] = useState('');
  const [selectedTournamentForRoom, setSelectedTournamentForRoom] = useState<Tournament | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPasswordInput, setRoomPasswordInput] = useState('');

  // Create Tournament Modal / Form state
  const [isCreatingTour, setIsCreatingTour] = useState(false);
  const [tourTitle, setTourTitle] = useState('');
  const [tourType, setTourType] = useState<MatchType>('SOLO');
  const [tourMap, setTourMap] = useState<GameMap>('Bermuda');
  const [tourMode, setTourMode] = useState<GameMode>('Battle Royale');
  const [tourBanner, setTourBanner] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80');
  const [tourEntryFee, setTourEntryFee] = useState(50);
  const [tourPrizePool, setTourPrizePool] = useState(2000);
  const [tourFirstPrize, setTourFirstPrize] = useState(1000);
  const [tourSecondPrize, setTourSecondPrize] = useState(500);
  const [tourThirdPrize, setTourThirdPrize] = useState(300);
  const [tourPerKill, setTourPerKill] = useState(15);
  const [tourMaxSlots, setTourMaxSlots] = useState(48);
  const [tourDateTime, setTourDateTime] = useState('');
  const [tourDeadline, setTourDeadline] = useState('');
  const [tourRules, setTourRules] = useState('Emulators banned. Level 40+ FF accounts. Fair play is strictly enforced.');

  // Winner Management state
  const [winnerTourId, setWinnerTourId] = useState<string>('');
  const [placementResults, setPlacementResults] = useState<Record<string, { placement: number; kills: number }>>({});

  // Notification Broadcast state
  const [notifTargetProfileId, setNotifTargetProfileId] = useState<string>('ALL');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');

  // Platform Settings state
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());

  if (!isAdmin) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#121520] border border-red-900/60 max-w-xl mx-auto my-8">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-white mb-1">Administrative Privileges Required</h2>
        <p className="text-xs text-slate-400 mb-4">
          This portal is strictly restricted to tournament directors and verified administrators.
        </p>
      </div>
    );
  }

  // Refresh data helpers
  const deposits = storage.getDeposits();
  const withdrawals = storage.getWithdrawals();
  const transactions = storage.getTransactions();
  const adminLogs = storage.getAdminLogs();

  // KPI Calculations
  const totalUsers = allProfiles.length;
  const activeTournaments = tournaments.filter(t => t.status === 'OPEN' || t.status === 'UPCOMING').length;
  const liveMatches = tournaments.filter(t => t.status === 'LIVE').length;
  const completedMatches = tournaments.filter(t => t.status === 'COMPLETED').length;
  const pendingDeposits = deposits.filter(d => d.status === 'PENDING').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING').length;
  const totalEntryFees = transactions
    .filter(t => t.type === 'ENTRY_FEE')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalPrizePaid = transactions
    .filter(t => t.type === 'PRIZE_MONEY')
    .reduce((acc, t) => acc + t.amount, 0);

  // USER MANAGEMENT HANDLERS
  const toggleBlockUser = (p: Profile) => {
    storage.saveProfile({ ...p, is_blocked: !p.is_blocked });
    storage.addAdminLog({
      admin_id: user?.id || 'admin',
      admin_name: user?.full_name || 'Admin',
      action: p.is_blocked ? 'UNBLOCKED_USER' : 'BLOCKED_USER',
      target_id: p.id,
      details: { email: p.email, name: p.full_name }
    });
    refreshUser();
    showToast(p.is_blocked ? 'User Unblocked' : 'User Blocked', p.full_name, 'info');
  };

  // DEPOSIT APPROVAL HANDLERS
  const handleApproveDeposit = (d: DepositRequest) => {
    const res = storage.approveDeposit(d.id, user?.id || 'admin');
    if (res.success) {
      showToast('Deposit Approved', res.message, 'success');
      refreshTournaments();
    } else {
      showToast('Error', res.message, 'error');
    }
  };

  const handleRejectDeposit = (d: DepositRequest) => {
    const reason = prompt('Enter reason for rejecting deposit:', 'Invalid TrxID or funds not received');
    if (reason) {
      const res = storage.rejectDeposit(d.id, user?.id || 'admin', reason);
      if (res.success) {
        showToast('Deposit Rejected', res.message, 'info');
        refreshTournaments();
      }
    }
  };

  // WITHDRAWAL APPROVAL HANDLERS
  const handleApproveWithdrawal = (w: WithdrawalRequest) => {
    const ref = prompt('Enter payout transaction reference (from bKash/Nagad):', `TXN-${Date.now().toString().slice(-6)}`);
    if (ref) {
      const res = storage.approveWithdrawal(w.id, user?.id || 'admin', ref);
      if (res.success) {
        showToast('Withdrawal Approved', res.message, 'success');
        refreshTournaments();
      }
    }
  };

  const handleRejectWithdrawal = (w: WithdrawalRequest) => {
    const reason = prompt('Enter reason for rejecting withdrawal (funds will be refunded to user):', 'Incorrect account number');
    if (reason) {
      const res = storage.rejectWithdrawal(w.id, user?.id || 'admin', reason);
      if (res.success) {
        showToast('Withdrawal Rejected', res.message, 'info');
        refreshTournaments();
      }
    }
  };

  // TOURNAMENT CREATION
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourTitle || !tourDateTime || !tourDeadline) {
      showToast('Validation Error', 'Please complete title, match date, and deadline.', 'warning');
      return;
    }

    const newTour: Tournament = {
      id: `tour-${Date.now()}`,
      title: tourTitle.trim(),
      match_type: tourType,
      game_map: tourMap,
      game_mode: tourMode,
      banner_url: tourBanner,
      description: `Official Free Fire ${tourType} tournament on ${tourMap}. Total Prize Pool: ৳ ${tourPrizePool}.`,
      rules: tourRules,
      entry_fee: Number(tourEntryFee),
      prize_pool: Number(tourPrizePool),
      first_prize: Number(tourFirstPrize),
      second_prize: Number(tourSecondPrize),
      third_prize: Number(tourThirdPrize),
      per_kill_prize: Number(tourPerKill),
      max_slots: Number(tourMaxSlots),
      registered_count: 0,
      match_date_time: new Date(tourDateTime).toISOString(),
      registration_deadline: new Date(tourDeadline).toISOString(),
      status: 'OPEN',
      room_published: false,
      created_by: user?.id,
      created_at: new Date().toISOString()
    };

    storage.saveTournament(newTour);
    storage.addAdminLog({
      admin_id: user?.id || 'admin',
      admin_name: user?.full_name || 'Admin',
      action: 'CREATED_TOURNAMENT',
      target_id: newTour.id,
      details: { title: newTour.title, prize: newTour.prize_pool }
    });

    storage.addNotification({
      profile_id: null, // broadcast
      title: `⚡ New Match Open: ${newTour.title}`,
      message: `Registration is open! Entry fee: ৳ ${newTour.entry_fee} | Prize pool: ৳ ${newTour.prize_pool}. Slots are filling fast!`,
      type: 'TOURNAMENT'
    });

    refreshTournaments();
    setIsCreatingTour(false);
    showToast('Tournament Created', 'Match is now live in the tournament lobby!', 'success');
  };

  // ROOM ID & PASSWORD MANAGEMENT
  const handlePublishRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournamentForRoom || !roomIdInput) {
      showToast('Error', 'Please enter a Room ID', 'warning');
      return;
    }

    selectedTournamentForRoom.room_id = roomIdInput.trim();
    selectedTournamentForRoom.room_password = roomPasswordInput.trim();
    selectedTournamentForRoom.room_published = true;
    selectedTournamentForRoom.status = 'LIVE';
    storage.saveTournament(selectedTournamentForRoom);

    // Notify all registered participants
    const tourParticipants = participants.filter(p => p.tournament_id === selectedTournamentForRoom.id);
    for (const p of tourParticipants) {
      storage.addNotification({
        profile_id: p.profile_id,
        title: `🔴 Room Credentials for ${selectedTournamentForRoom.title}`,
        message: `Match is starting! Room ID: ${roomIdInput.trim()} | Password: ${roomPasswordInput.trim() || 'None'}. Join immediately!`,
        type: 'MATCH_ROOM'
      });
    }

    storage.addAdminLog({
      admin_id: user?.id || 'admin',
      admin_name: user?.full_name || 'Admin',
      action: 'PUBLISHED_ROOM_CREDENTIALS',
      target_id: selectedTournamentForRoom.id,
      details: { roomId: roomIdInput, match: selectedTournamentForRoom.title }
    });

    refreshTournaments();
    setSelectedTournamentForRoom(null);
    showToast('Room Published', 'Room ID and Password sent to all registered participants!', 'success');
  };

  // WINNERS & PRIZE DISTRIBUTION
  const handleDeclareWinners = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerTourId) {
      showToast('Error', 'Select a tournament first', 'warning');
      return;
    }

    const tourParticipants = participants.filter(p => p.tournament_id === winnerTourId);
    if (tourParticipants.length === 0) {
      showToast('No Participants', 'No participants registered in this tournament.', 'warning');
      return;
    }

    const payload = tourParticipants.map(p => {
      const resultEntry = placementResults[p.profile_id] || { placement: 99, kills: 0 };
      return {
        profile_id: p.profile_id,
        placement: Number(resultEntry.placement),
        kills: Number(resultEntry.kills)
      };
    });

    const res = storage.submitTournamentResults(winnerTourId, payload, user?.id || 'admin');
    if (res.success) {
      showToast('Prizes Distributed', res.message, 'success');
      refreshTournaments();
      setWinnerTourId('');
      setPlacementResults({});
    } else {
      showToast('Error', res.message, 'error');
    }
  };

  // NOTIFICATION BROADCAST
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) {
      showToast('Error', 'Enter title and message', 'warning');
      return;
    }

    storage.addNotification({
      profile_id: notifTargetProfileId === 'ALL' ? null : notifTargetProfileId,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: 'SYSTEM'
    });

    storage.addAdminLog({
      admin_id: user?.id || 'admin',
      admin_name: user?.full_name || 'Admin',
      action: 'SENT_NOTIFICATION',
      details: { title: notifTitle, target: notifTargetProfileId }
    });

    setNotifTitle('');
    setNotifMessage('');
    showToast('Dispatched', 'Notification has been pushed.', 'success');
  };

  // SETTINGS SAVE
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(settings);
    storage.addAdminLog({
      admin_id: user?.id || 'admin',
      admin_name: user?.full_name || 'Admin',
      action: 'UPDATED_PAYMENT_SETTINGS',
      details: { 
        nagad: { number: settings.nagad_number, enabled: settings.nagad_enabled },
        bkash: { number: settings.bkash_number, enabled: settings.bkash_enabled },
        rocket: { number: settings.rocket_number, enabled: settings.rocket_enabled },
        min_deposit: settings.min_deposit,
        min_withdrawal: settings.min_withdrawal
      }
    });
    showToast('Settings Saved', 'Payment gateway & platform settings saved permanently in database.', 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-[#121520] to-rose-950/40 border border-purple-800/40 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                Admin Control Room
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Free Fire Tournament Management · Financial Audits · Automated Prize Payouts
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreatingTour(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Match
        </button>
      </div>

      {/* 12 Admin Sub-Navigation Modules */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
          { id: 'users', label: '2. Users', icon: Users },
          { id: 'tournaments', label: '3. Tournaments', icon: Swords },
          { id: 'matches', label: '4. Match Rooms', icon: PlayCircle },
          { id: 'deposits', label: `5. Deposits (${pendingDeposits})`, icon: ArrowDownRight },
          { id: 'withdrawals', label: `6. Withdrawals (${pendingWithdrawals})`, icon: ArrowUpRight },
          { id: 'winners', label: '7. Declare Winners', icon: Award },
          { id: 'leaderboard', label: '8. Leaderboard', icon: Trophy },
          { id: 'notifications', label: '9. Notifications', icon: Bell },
          { id: 'transactions', label: '10. Ledger', icon: Receipt },
          { id: 'logs', label: '11. Audit Logs', icon: History },
          { id: 'settings', label: '12. Settings', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 border ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/60'
                  : 'bg-[#121520] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Registered Gamers</span>
              <span className="text-2xl font-black text-white mt-1 block">{totalUsers}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active Free Fire players</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Tournaments</span>
              <span className="text-2xl font-black text-white mt-1 block">{activeTournaments}</span>
              <span className="text-[10px] text-rose-400 font-semibold">{liveMatches} Live custom rooms</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Deposits</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">{pendingDeposits}</span>
              <span className="text-[10px] text-slate-400">Needs review & approval</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pending Withdrawals</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">{pendingWithdrawals}</span>
              <span className="text-[10px] text-slate-400">Awaiting merchant payout</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Entry Collected</span>
              <span className="text-2xl font-black text-white mt-1 block">৳ {totalEntryFees}</span>
              <span className="text-[10px] text-emerald-400">From player tournament joins</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Prize Distributed</span>
              <span className="text-2xl font-black text-amber-400 mt-1 block">৳ {totalPrizePaid}</span>
              <span className="text-[10px] text-slate-400">Paid out to winners</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completed Matches</span>
              <span className="text-2xl font-black text-white mt-1 block">{completedMatches}</span>
              <span className="text-[10px] text-slate-400">Concluded tournaments</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Platform Revenue</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                ৳ {Math.max(0, totalEntryFees - totalPrizePaid)}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Net tournament margin</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Registered Users & Free Fire Profiles ({allProfiles.length})
            </h3>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search by name, email, UID, IGN..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[#121520] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User / Gamer</th>
                    <th className="p-3.5">Free Fire Info</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allProfiles
                    .filter(p => 
                      p.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      p.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                      p.ff_name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      p.ff_uid.includes(userSearch)
                    )
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3.5 flex items-center gap-3">
                          <img src={p.avatar_url} alt={p.ff_name} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className="font-bold text-white">{p.full_name}</div>
                            <div className="text-[10px] text-slate-400">{p.email}</div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-mono font-bold text-rose-400">{p.ff_name}</div>
                          <div className="font-mono text-[10px] text-slate-400">UID: {p.ff_uid}</div>
                        </td>
                        <td className="p-3.5 font-mono">{p.phone_number || 'N/A'}</td>
                        <td className="p-3.5 capitalize font-semibold">{p.role}</td>
                        <td className="p-3.5">
                          {p.is_blocked ? (
                            <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 text-[10px] font-bold">
                              Blocked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => toggleBlockUser(p)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                              p.is_blocked
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-red-950 hover:bg-red-900 text-red-300'
                            }`}
                          >
                            {p.is_blocked ? 'Unblock' : 'Block User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: TOURNAMENT MANAGEMENT */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              All Tournaments ({tournaments.length})
            </h3>
            <button
              onClick={() => setIsCreatingTour(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Match
            </button>
          </div>

          <div className="rounded-2xl bg-[#121520] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Title & Format</th>
                    <th className="p-3.5">Map</th>
                    <th className="p-3.5">Entry / Pool</th>
                    <th className="p-3.5">Slots</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tournaments.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{t.title}</div>
                        <div className="text-[10px] text-slate-400">{t.match_type} · {t.game_mode}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-rose-400">{t.game_map}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">৳ {t.entry_fee}</div>
                        <div className="text-[10px] text-emerald-400">Pool: ৳ {t.prize_pool}</div>
                      </td>
                      <td className="p-3.5 font-bold">
                        {t.registered_count} / {t.max_slots}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-200">
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTournamentForRoom(t);
                            setRoomIdInput(t.room_id || '');
                            setRoomPasswordInput(t.room_password || '');
                          }}
                          className="px-2 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 text-[11px] font-bold transition"
                        >
                          Room ID
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${t.title}?`)) {
                              storage.deleteTournament(t.id);
                              refreshTournaments();
                            }
                          }}
                          className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 text-[11px] font-bold transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: MATCH ROOM CONTROL */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Live Match Room Credential Dispatcher
          </h3>
          <p className="text-xs text-slate-400">
            Enter Room ID and Password for upcoming and live Free Fire matches. Releasing credentials sends an instant in-app notification to all registered participants.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournaments.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-[#121520] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">{t.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {t.match_type} · {t.game_map} · {t.registered_count} players
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.status === 'LIVE' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Room ID:</span>
                    <span className="font-mono font-bold text-rose-400">{t.room_id || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Password:</span>
                    <span className="font-mono font-bold text-purple-400">{t.room_password || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Credentials Published:</span>
                    <span className={`font-bold ${t.room_published ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {t.room_published ? 'Yes (Visible to players)' : 'No (Hidden)'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedTournamentForRoom(t);
                    setRoomIdInput(t.room_id || '');
                    setRoomPasswordInput(t.room_password || '');
                  }}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  Set / Publish Room ID & Password
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: DEPOSIT REQUESTS */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Deposit Verification Requests ({deposits.length})
            </h3>
            <span className="text-xs text-amber-400 font-bold">
              {pendingDeposits} Pending Verification
            </span>
          </div>

          <div className="rounded-2xl bg-[#121520] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Gamer</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Sender Mobile</th>
                    <th className="p-3.5">Transaction ID (TrxID)</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{d.user_name || 'Player'}</div>
                        <div className="text-[10px] text-slate-400">{d.user_email}</div>
                      </td>
                      <td className="p-3.5 font-bold text-rose-400">{d.method}</td>
                      <td className="p-3.5 font-black text-white">৳ {d.amount}</td>
                      <td className="p-3.5 font-mono">{d.sender_number}</td>
                      <td className="p-3.5 font-mono font-bold text-amber-400 tracking-wider">
                        {d.transaction_id}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          d.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : d.status === 'PENDING' ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {d.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApproveDeposit(d)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectDeposit(d)}
                              className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 font-bold text-[11px] transition"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: WITHDRAWAL REQUESTS */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Withdrawal Payout Requests ({withdrawals.length})
            </h3>
            <span className="text-xs text-rose-400 font-bold">
              {pendingWithdrawals} Awaiting Disbursement
            </span>
          </div>

          <div className="rounded-2xl bg-[#121520] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Gamer</th>
                    <th className="p-3.5">Method & Type</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Receiver Number</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Payout Reference</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{w.user_name || 'Player'}</div>
                        <div className="text-[10px] text-slate-400">{w.user_email}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-rose-400">{w.method}</div>
                        <div className="text-[10px] text-slate-400">{w.account_type}</div>
                      </td>
                      <td className="p-3.5 font-black text-white">৳ {w.amount}</td>
                      <td className="p-3.5 font-mono">{w.receiver_number}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          w.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' : w.status === 'PENDING' ? 'bg-amber-950 text-amber-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-400">
                        {w.payout_reference || 'N/A'}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {w.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleApproveWithdrawal(w)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                            >
                              Approve Payout
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(w)}
                              className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 font-bold text-[11px] transition"
                            >
                              Reject & Refund
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 7: WINNER MANAGEMENT & PRIZE DISTRIBUTION */}
      {activeTab === 'winners' && (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Declare Winners & Automatic Prize Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a tournament, input final placement and kills per participant. The system calculates points based on the official Free Fire scoring system and credits cash prizes atomically into winners&apos; wallets!
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#121520] border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Tournament
              </label>
              <select
                value={winnerTourId}
                onChange={(e) => setWinnerTourId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">-- Choose Tournament to Finalize --</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.status}) - Prize Pool: ৳{t.prize_pool}
                  </option>
                ))}
              </select>
            </div>

            {winnerTourId && (
              <form onSubmit={handleDeclareWinners} className="space-y-4 pt-2">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Enter Match Placement & Kills for Registered Players
                  </h4>

                  {participants.filter(p => p.tournament_id === winnerTourId).length === 0 ? (
                    <div className="text-xs text-slate-400 py-4 text-center">
                      No participants registered in this tournament yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {participants
                        .filter(p => p.tournament_id === winnerTourId)
                        .map((p) => {
                          const currentVal = placementResults[p.profile_id] || { placement: 1, kills: 0 };
                          return (
                            <div key={p.id} className="p-3 rounded-lg bg-black/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div>
                                <span className="font-bold text-white block">{p.ff_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">UID: {p.ff_uid} · Slot #{p.slot_number}</span>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <label className="text-[11px] text-slate-400">Rank:</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={48}
                                    value={currentVal.placement}
                                    onChange={(e) => {
                                      setPlacementResults(prev => ({
                                        ...prev,
                                        [p.profile_id]: {
                                          ...currentVal,
                                          placement: Number(e.target.value)
                                        }
                                      }));
                                    }}
                                    className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white font-bold text-center"
                                  />
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <label className="text-[11px] text-slate-400">Kills:</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={currentVal.kills}
                                    onChange={(e) => {
                                      setPlacementResults(prev => ({
                                        ...prev,
                                        [p.profile_id]: {
                                          ...currentVal,
                                          kills: Number(e.target.value)
                                        }
                                      }));
                                    }}
                                    className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-rose-400 font-bold text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition"
                >
                  Distribute Prizes & Conclude Tournament
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 8: LEADERBOARD PREVIEW */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            All-Time Hall of Fame Leaderboard
          </h3>
          <div className="rounded-2xl bg-[#121520] border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Gamer</th>
                  <th className="p-3.5">UID</th>
                  <th className="p-3.5">Matches</th>
                  <th className="p-3.5">Wins</th>
                  <th className="p-3.5">Kills</th>
                  <th className="p-3.5 text-right">Prize Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[...allProfiles]
                  .sort((a, b) => (b.stats?.total_earnings || 0) - (a.stats?.total_earnings || 0))
                  .map((p, i) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 font-black text-rose-500">#{i + 1}</td>
                      <td className="p-3.5 font-bold text-white">{p.ff_name}</td>
                      <td className="p-3.5 font-mono text-[10px] text-slate-400">{p.ff_uid}</td>
                      <td className="p-3.5">{p.stats?.matches_played || 0}</td>
                      <td className="p-3.5 font-bold text-amber-400">{p.stats?.wins || 0}</td>
                      <td className="p-3.5 font-bold text-rose-400">{p.stats?.kills || 0}</td>
                      <td className="p-3.5 text-right font-black text-emerald-400">
                        ৳ {p.stats?.total_earnings || 0}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 9: NOTIFICATIONS MANAGER */}
      {activeTab === 'notifications' && (
        <div className="space-y-4 max-w-xl">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Broadcast In-App Push Notification
          </h3>
          <form onSubmit={handleSendNotification} className="p-5 rounded-2xl bg-[#121520] border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Audience
              </label>
              <select
                value={notifTargetProfileId}
                onChange={(e) => setNotifTargetProfileId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              >
                <option value="ALL">All Players (Broadcast to Everyone)</option>
                {allProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ff_name} ({p.full_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notification Headline
              </label>
              <input
                type="text"
                required
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="e.g. 🏆 Weekend Solo Cup Starts in 1 Hour!"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Notification Message
              </label>
              <textarea
                rows={3}
                required
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                placeholder="Message body displayed to gamers..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Dispatch Notification
            </button>
          </form>
        </div>
      )}

      {/* SUB-VIEW 10: TRANSACTION HISTORY */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Platform Immutable Financial Ledger ({transactions.length})
          </h3>
          <div className="rounded-2xl bg-[#121520] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Balance After</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3.5 whitespace-nowrap text-slate-400">
                        {new Date(t.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-bold uppercase text-[11px] text-purple-400">{t.type}</td>
                      <td className="p-3.5 font-medium text-white">{t.description}</td>
                      <td className={`p-3.5 font-black ${t.amount > 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {t.amount > 0 ? `+৳ ${t.amount}` : `-৳ ${Math.abs(t.amount)}`}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">৳ {t.balance_after}</td>
                      <td className="p-3.5 text-right font-bold text-emerald-400 uppercase text-[10px]">
                        {t.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 11: ADMIN AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Administrative Audit Trail & Activity Logs ({adminLogs.length})
          </h3>
          <div className="rounded-2xl bg-[#121520] border border-slate-800 divide-y divide-slate-800/60 overflow-hidden shadow-xl">
            {adminLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-800/30 transition">
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono text-[10px]">
                      {log.action}
                    </span>
                    <span>by {log.admin_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Details: {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 12: APP SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-[#121520] border border-slate-800 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Payment Gateway Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure available mobile banking payment methods. Only enabled gateways are shown on the user Add Money page.
            </p>
          </div>

          {/* 3 Dedicated Payment Gateway Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. NAGAD (ENABLED) */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
              settings.nagad_enabled 
                ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-950/30' 
                : 'bg-slate-900/60 border-slate-800 opacity-75'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-black text-white text-sm">Nagad</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                  settings.nagad_enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {settings.nagad_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nagad Account Number:
                </label>
                <input
                  type="text"
                  value={settings.nagad_number}
                  onChange={(e) => setSettings({ ...settings, nagad_number: e.target.value })}
                  placeholder="01970246557"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  {settings.nagad_enabled ? 'Visible to players' : 'Hidden from players'}
                </span>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, nagad_enabled: !settings.nagad_enabled })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                    settings.nagad_enabled
                      ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  {settings.nagad_enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* 2. BKASH (DISABLED BY DEFAULT - CAN BE ENABLED LATER BY ADDING NUMBER) */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
              settings.bkash_enabled 
                ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30' 
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${settings.bkash_enabled ? 'bg-rose-400' : 'bg-slate-600'}`} />
                  <span className="font-black text-white text-sm">bKash</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                  settings.bkash_enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {settings.bkash_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  bKash Account Number:
                </label>
                <input
                  type="text"
                  value={settings.bkash_number}
                  onChange={(e) => setSettings({ ...settings, bkash_number: e.target.value })}
                  placeholder="e.g. 017xxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  {settings.bkash_enabled ? 'Visible to players' : 'Hidden from players'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.bkash_enabled && !settings.bkash_number.trim()) {
                      showToast('Account Number Required', 'Please enter a bKash account number before enabling.', 'warning');
                      return;
                    }
                    setSettings({ ...settings, bkash_enabled: !settings.bkash_enabled });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                    settings.bkash_enabled
                      ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {settings.bkash_enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* 3. ROCKET (DISABLED BY DEFAULT - CAN BE ENABLED LATER BY ADDING NUMBER) */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
              settings.rocket_enabled 
                ? 'bg-purple-950/20 border-purple-500/40 shadow-lg shadow-purple-950/30' 
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${settings.rocket_enabled ? 'bg-purple-400' : 'bg-slate-600'}`} />
                  <span className="font-black text-white text-sm">Rocket</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                  settings.rocket_enabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {settings.rocket_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Rocket Account Number:
                </label>
                <input
                  type="text"
                  value={settings.rocket_number}
                  onChange={(e) => setSettings({ ...settings, rocket_number: e.target.value })}
                  placeholder="e.g. 019xxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">
                  {settings.rocket_enabled ? 'Visible to players' : 'Hidden from players'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!settings.rocket_enabled && !settings.rocket_number.trim()) {
                      showToast('Account Number Required', 'Please enter a Rocket account number before enabling.', 'warning');
                      return;
                    }
                    setSettings({ ...settings, rocket_enabled: !settings.rocket_enabled });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                    settings.rocket_enabled
                      ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {settings.rocket_enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Minimum Deposit (৳ BDT)
              </label>
              <input
                type="number"
                value={settings.min_deposit}
                onChange={(e) => setSettings({ ...settings, min_deposit: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Minimum Withdrawal (৳ BDT)
              </label>
              <input
                type="number"
                value={settings.min_withdrawal}
                onChange={(e) => setSettings({ ...settings, min_withdrawal: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Tournament Points Per Kill
              </label>
              <input
                type="number"
                value={settings.point_per_kill}
                onChange={(e) => setSettings({ ...settings, point_per_kill: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Global Platform Ticker Announcement
            </label>
            <input
              type="text"
              value={settings.announcement_banner}
              onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <strong className="text-white block mb-0.5">Database & Supabase Connection Status:</strong>
            Full PostgreSQL 14-table schema migrations generated in <code className="text-purple-400">/supabase/migrations/20261106_initial_schema.sql</code>. Active in-memory/localStorage replication running with atomic integrity.
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
          >
            Save Configuration
          </button>
        </form>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {isCreatingTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#121520] border border-rose-950/80 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 my-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreatingTour(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white mb-4">Create Free Fire Tournament</h3>

            <form onSubmit={handleCreateTournament} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tournament Title</label>
                <input
                  type="text"
                  required
                  value={tourTitle}
                  onChange={(e) => setTourTitle(e.target.value)}
                  placeholder="e.g. 🔥 BERMUDA SOLO NIGHT CUP #43"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Match Type</label>
                  <select
                    value={tourType}
                    onChange={(e) => setTourType(e.target.value as MatchType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="SOLO">SOLO</option>
                    <option value="DUO">DUO</option>
                    <option value="SQUAD">SQUAD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Map</label>
                  <select
                    value={tourMap}
                    onChange={(e) => setTourMap(e.target.value as GameMap)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="Bermuda">Bermuda</option>
                    <option value="Purgatory">Purgatory</option>
                    <option value="Kalahari">Kalahari</option>
                    <option value="Alpine">Alpine</option>
                    <option value="Nexterra">Nexterra</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Game Mode</label>
                  <select
                    value={tourMode}
                    onChange={(e) => setTourMode(e.target.value as GameMode)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  >
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="Clash Squad">Clash Squad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Entry Fee (৳ BDT)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={tourEntryFee}
                    onChange={(e) => setTourEntryFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Total Prize Pool (৳ BDT)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={tourPrizePool}
                    onChange={(e) => setTourPrizePool(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">1st Prize</label>
                  <input
                    type="number"
                    value={tourFirstPrize}
                    onChange={(e) => setTourFirstPrize(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">2nd Prize</label>
                  <input
                    type="number"
                    value={tourSecondPrize}
                    onChange={(e) => setTourSecondPrize(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">3rd Prize</label>
                  <input
                    type="number"
                    value={tourThirdPrize}
                    onChange={(e) => setTourThirdPrize(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Per Kill</label>
                  <input
                    type="number"
                    value={tourPerKill}
                    onChange={(e) => setTourPerKill(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Slots</label>
                  <input
                    type="number"
                    min={4}
                    value={tourMaxSlots}
                    onChange={(e) => setTourMaxSlots(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Match Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={tourDateTime}
                    onChange={(e) => setTourDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Reg. Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={tourDeadline}
                    onChange={(e) => setTourDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rules & Notes</label>
                <textarea
                  rows={2}
                  value={tourRules}
                  onChange={(e) => setTourRules(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg mt-2"
              >
                Publish Tournament to Lobby
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SET ROOM ID & PASSWORD MODAL */}
      {selectedTournamentForRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#121520] border border-purple-800 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedTournamentForRoom(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-white mb-1">Release Room Credentials</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedTournamentForRoom.title}</p>

            <form onSubmit={handlePublishRoom} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Free Fire Room ID</label>
                <input
                  type="text"
                  required
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="e.g. 7829104"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Room Password</label>
                <input
                  type="text"
                  value={roomPasswordInput}
                  onChange={(e) => setRoomPasswordInput(e.target.value)}
                  placeholder="e.g. pro123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-400 font-mono font-bold text-base focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
                ⚠️ Clicking publish marks match as <strong>LIVE</strong> and immediately sends credentials to registered players.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
              >
                Publish Room to Players
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
