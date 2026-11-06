import React, { useState } from 'react';
import { Tournament, TournamentParticipant, TournamentResult } from '../../types';
import { useTournaments } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Gamepad2, 
  Key, 
  Copy, 
  Check, 
  Trophy, 
  Crosshair, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  PlayCircle,
  Swords
} from 'lucide-react';

interface Props {
  onSelectTournament: (t: Tournament) => void;
  onExploreTournaments: () => void;
}

export const MyMatchesView: React.FC<Props> = ({ onSelectTournament, onExploreTournaments }) => {
  const { user } = useAuth();
  const { tournaments, participants } = useTournaments();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#121520] border border-slate-800">
        <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Sign In to View Your Matches</h3>
        <p className="text-xs text-slate-400 mb-4">
          Keep track of your registered Free Fire custom rooms and match results.
        </p>
      </div>
    );
  }

  // Get user's participants
  const userParticipants = participants.filter(p => p.profile_id === user.id && p.payment_status === 'PAID');
  const registeredTournamentIds = new Set(userParticipants.map(p => p.tournament_id));

  // Get matching tournaments
  const myTournaments = tournaments.filter(t => registeredTournamentIds.has(t.id));
  const results = storage.getResults().filter(r => r.profile_id === user.id);

  const filteredTournaments = myTournaments.filter((t) => {
    if (activeTab === 'live') return t.status === 'LIVE';
    if (activeTab === 'upcoming') return t.status === 'OPEN' || t.status === 'UPCOMING';
    if (activeTab === 'completed') return t.status === 'COMPLETED';
    return true;
  });

  const copyRoom = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied', text, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              My Matches & Room Access
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Your registered Free Fire tournament schedule, custom room credentials, and results.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] ${
              activeTab === 'all' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({myTournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] ${
              activeTab === 'live' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] ${
              activeTab === 'upcoming' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] ${
              activeTab === 'completed' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Matches List */}
      {filteredTournaments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121520] border border-slate-800">
          <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Matches Found in this Category</h3>
          <p className="text-xs text-slate-400 mb-4">
            You haven&apos;t joined any tournaments in this category yet.
          </p>
          <button
            onClick={onExploreTournaments}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition"
          >
            Browse Tournaments
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTournaments.map((tournament) => {
            const participant = userParticipants.find(p => p.tournament_id === tournament.id);
            const result = results.find(r => r.tournament_id === tournament.id);
            const isLive = tournament.status === 'LIVE';

            return (
              <div
                key={tournament.id}
                className={`rounded-2xl bg-[#121520] border transition-all overflow-hidden ${
                  isLive ? 'border-red-500/60 shadow-xl shadow-red-950/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Tournament Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={tournament.banner_url}
                      alt={tournament.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-800"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-black/60 border border-white/10 text-white uppercase">
                          {tournament.match_type}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
                          {tournament.game_map}
                        </span>
                        {isLive && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white uppercase animate-pulse">
                            🔴 LIVE NOW
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-white">
                        {tournament.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(tournament.match_date_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400 font-bold">
                          Slot #{participant?.slot_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle / Right: Room Credentials or Results */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {tournament.status === 'COMPLETED' ? (
                      result ? (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 w-full sm:w-auto">
                          <div className="flex items-center gap-3 font-bold">
                            <span className="text-amber-400 flex items-center gap-1">
                              <Trophy className="w-3.5 h-3.5" />
                              Rank #{result.placement}
                            </span>
                            <span className="text-rose-400 flex items-center gap-1">
                              <Crosshair className="w-3.5 h-3.5" />
                              {result.kills} Kills
                            </span>
                          </div>
                          {result.prize_won > 0 && (
                            <div className="text-xs font-black text-emerald-400">
                              Won: +৳ {result.prize_won} BDT
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">Results Being Verified</div>
                      )
                    ) : tournament.room_published && tournament.room_id ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 flex items-center gap-3 w-full sm:w-auto">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Custom Room ID</div>
                          <div className="text-sm font-black text-rose-400 font-mono tracking-wider">
                            {tournament.room_id}
                          </div>
                        </div>
                        <button
                          onClick={() => copyRoom(tournament.room_id!, `id-${tournament.id}`)}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition"
                          title="Copy Room ID"
                        >
                          {copiedId === `id-${tournament.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <div className="border-l border-slate-800 pl-3">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Password</div>
                          <div className="text-sm font-black text-purple-400 font-mono tracking-wider">
                            {tournament.room_password || 'None'}
                          </div>
                        </div>
                        <button
                          onClick={() => copyRoom(tournament.room_password || '', `pass-${tournament.id}`)}
                          className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white transition"
                          title="Copy Password"
                        >
                          {copiedId === `pass-${tournament.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Room credentials unlock 15m before match</span>
                      </div>
                    )}

                    <button
                      onClick={() => onSelectTournament(tournament)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
