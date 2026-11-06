import React, { useState } from 'react';
import { Tournament, TournamentParticipant } from '../../types';
import { useTournaments } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  X, 
  Trophy, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Lock, 
  Key, 
  Copy, 
  Check, 
  Swords, 
  AlertTriangle, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  tournament: Tournament | null;
  onClose: () => void;
  onJoinClick: (tournament: Tournament) => void;
}

export const TournamentDetailsModal: React.FC<Props> = ({ tournament, onClose, onJoinClick }) => {
  const { isRegistered, getUserParticipantInfo, leaveTournament, participants } = useTournaments();
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotifications();

  const [copiedField, setCopiedField] = useState<'id' | 'pass' | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'rules' | 'participants'>('details');

  if (!tournament) return null;

  const registered = isRegistered(tournament.id);
  const participantInfo = getUserParticipantInfo(tournament.id);
  const tournamentParticipants = participants.filter(p => p.tournament_id === tournament.id && p.payment_status === 'PAID');
  const isFull = tournament.registered_count >= tournament.max_slots;
  const isDeadlinePassed = new Date(tournament.registration_deadline) < new Date();
  const canLeave = registered && !isDeadlinePassed && tournament.status !== 'LIVE' && tournament.status !== 'COMPLETED';

  const copyToClipboard = (text: string, field: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast('Copied to Clipboard', text, 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleLeave = () => {
    if (confirm(`Are you sure you want to leave ${tournament.title}? Your entry fee of ৳ ${tournament.entry_fee} will be refunded to your wallet.`)) {
      const res = leaveTournament(tournament.id);
      if (res.success) {
        showToast('Left Tournament', res.message, 'success');
        onClose();
      } else {
        showToast('Error', res.message, 'error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-[#121520] border border-rose-950/70 shadow-2xl text-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header with Banner */}
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          <img
            src={tournament.banner_url}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-slate-950/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Match Status & Format */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-white font-extrabold text-xs uppercase">
              {tournament.match_type}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-600/90 text-white font-bold text-xs uppercase">
              {tournament.game_mode}
            </span>
          </div>

          {/* Title & Location on banner bottom */}
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Map: {tournament.game_map}</span>
              <span className="text-slate-500">·</span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300">
                {new Date(tournament.match_date_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide leading-tight">
              {tournament.title}
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-900/50 shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Prizes
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'rules'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Rules & System
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`py-3 px-4 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'participants'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Participants ({tournament.registered_count}/{tournament.max_slots})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'details' && (
            <>
              {/* ROOM ID & PASSWORD SECTION */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#171a29] border border-rose-900/40 p-4 sm:p-5 shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-rose-400" />
                    <h4 className="text-sm font-extrabold text-white tracking-wider uppercase">
                      Custom Room Access
                    </h4>
                  </div>
                  {registered && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Player (Slot #{participantInfo?.slot_number})
                    </span>
                  )}
                </div>

                {registered ? (
                  tournament.room_published && tournament.room_id ? (
                    <div className="space-y-3">
                      <p className="text-xs text-emerald-300 font-medium">
                        🎮 Match room is ready! Open Free Fire &gt; Custom &gt; Join with credentials below:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Room ID Box */}
                        <div className="p-3 rounded-xl bg-black/60 border border-rose-500/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Room ID</span>
                            <span className="text-lg font-black text-rose-400 tracking-wider font-mono">
                              {tournament.room_id}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(tournament.room_id!, 'id')}
                            className="p-2 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white transition-colors"
                            title="Copy Room ID"
                          >
                            {copiedField === 'id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Room Password Box */}
                        <div className="p-3 rounded-xl bg-black/60 border border-purple-500/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Password</span>
                            <span className="text-lg font-black text-purple-400 tracking-wider font-mono">
                              {tournament.room_password || 'None'}
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(tournament.room_password || '', 'pass')}
                            className="p-2 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white transition-colors"
                            title="Copy Password"
                          >
                            {copiedField === 'pass' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <strong className="text-white block">Room ID & Password will unlock before match time</strong>
                        Official admin releases room credentials 15 minutes prior to match schedule. You will also get an instant notification!
                      </div>
                    </div>
                  )
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
                    <Lock className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                      <strong className="text-slate-200 block">Credentials Protected</strong>
                      Room ID and Password are encrypted and visible exclusively to confirmed registered participants.
                    </div>
                  </div>
                )}
              </div>

              {/* Prize Breakdown Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  Prize Distribution Breakdown (Total Pool: ৳ {tournament.prize_pool})
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-center">
                    <div className="text-[11px] font-bold text-amber-400 uppercase">🥇 1st Place</div>
                    <div className="text-lg font-black text-white mt-0.5">৳ {tournament.first_prize}</div>
                    <div className="text-[10px] text-slate-400">Grand Champion</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                    <div className="text-[11px] font-bold text-slate-300 uppercase">🥈 2nd Place</div>
                    <div className="text-lg font-black text-white mt-0.5">৳ {tournament.second_prize}</div>
                    <div className="text-[10px] text-slate-400">Runner Up</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-800/40 text-center">
                    <div className="text-[11px] font-bold text-amber-600 uppercase">🥉 3rd Place</div>
                    <div className="text-lg font-black text-white mt-0.5">৳ {tournament.third_prize}</div>
                    <div className="text-[10px] text-slate-400">2nd Runner Up</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 text-center">
                    <div className="text-[11px] font-bold text-rose-400 uppercase">🎯 Kill Bounty</div>
                    <div className="text-lg font-black text-white mt-0.5">
                      {tournament.per_kill_prize > 0 ? `৳ ${tournament.per_kill_prize}` : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400">Per Kill Cash</div>
                  </div>
                </div>
              </div>

              {/* Tournament Match Facts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Entry Fee</span>
                  <span className="text-sm font-bold text-white">
                    {tournament.entry_fee > 0 ? `৳ ${tournament.entry_fee} BDT` : 'Free Entry'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Slots Available</span>
                  <span className="text-sm font-bold text-white">
                    {tournament.registered_count} / {tournament.max_slots}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 text-[10px] block">Reg. Closes</span>
                  <span className="text-sm font-bold text-white">
                    {new Date(tournament.registration_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Tournament Brief */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tournament Description</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                  {tournament.description}
                </p>
              </div>
            </>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Swords className="w-4 h-4 text-rose-500" />
                  Tournament Regulations
                </h4>
                <p className="leading-relaxed text-slate-300 whitespace-pre-line">
                  {tournament.rules || 'Standard Free Fire esports guidelines apply. Fair play is strictly enforced.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-purple-400" />
                  Scoring System (Official Battle Royale)
                </h4>
                <ul className="space-y-1 text-slate-300 text-xs list-disc list-inside">
                  <li>1st Place (Booyah): <strong>12 Points</strong></li>
                  <li>2nd Place: <strong>9 Points</strong></li>
                  <li>3rd Place: <strong>8 Points</strong></li>
                  <li>4th Place: <strong>7 Points</strong></li>
                  <li>5th Place: <strong>6 Points</strong></li>
                  <li>Each Kill: <strong>2 Points + ৳ Per-Kill Cash Reward</strong></li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Emulators, scripts, or hacks will result in immediate disqualification and permanent wallet suspension.</span>
              </div>
            </div>
          )}

          {activeTab === 'participants' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Registered Players ({tournamentParticipants.length})</span>
                <span>Max Slots: {tournament.max_slots}</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 rounded-xl bg-slate-900/60 border border-slate-800">
                {tournamentParticipants.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No players registered yet. Be the first to join!
                  </div>
                ) : (
                  tournamentParticipants.map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-slate-800 text-rose-400 font-bold flex items-center justify-center text-[11px]">
                          #{p.slot_number}
                        </div>
                        <div>
                          <div className="font-bold text-white">{p.ff_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">UID: {p.ff_uid}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0 flex items-center justify-between gap-3">
          {registered ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>You are registered in Slot #{participantInfo?.slot_number}</span>
              </div>

              {canLeave && (
                <button
                  onClick={handleLeave}
                  className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/40 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave & Refund
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">Entry Fee</span>
                <span className="text-base font-black text-white">
                  {tournament.entry_fee > 0 ? `৳ ${tournament.entry_fee} BDT` : 'Free Entry'}
                </span>
              </div>

              {tournament.status === 'OPEN' && !isFull && !isDeadlinePassed ? (
                <button
                  onClick={() => onJoinClick(tournament)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-rose-950/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <Swords className="w-4 h-4" />
                  Join Tournament
                </button>
              ) : (
                <button
                  disabled
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed"
                >
                  {isFull ? 'Slots Full' : isDeadlinePassed ? 'Registration Closed' : 'Unavailable'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
