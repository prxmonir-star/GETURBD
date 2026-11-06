import React from 'react';
import { Tournament } from '../../types';
import { useTournaments } from '../../context/TournamentContext';
import { Users, Trophy, Crosshair, Calendar, MapPin, Swords, ShieldCheck, PlayCircle } from 'lucide-react';

interface Props {
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
  onQuickJoin?: (tournament: Tournament) => void;
}

export const TournamentCard: React.FC<Props> = ({ tournament, onSelect, onQuickJoin }) => {
  const { isRegistered, getUserParticipantInfo } = useTournaments();
  const registered = isRegistered(tournament.id);
  const participantInfo = getUserParticipantInfo(tournament.id);

  const slotPercent = Math.min(100, Math.round((tournament.registered_count / tournament.max_slots) * 100));
  const isFull = tournament.registered_count >= tournament.max_slots;
  const matchDate = new Date(tournament.match_date_time);

  return (
    <div 
      onClick={() => onSelect(tournament)}
      className="group relative rounded-2xl bg-[#121520] border border-slate-800/80 hover:border-rose-500/50 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/30 flex flex-col"
    >
      {/* Banner Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        <img
          src={tournament.banner_url}
          alt={tournament.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121520] via-slate-950/40 to-transparent" />

        {/* Top Floating Status & Mode */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Match Type Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-white font-extrabold text-[11px] tracking-wider uppercase">
            <Swords className="w-3 h-3 text-rose-500" />
            <span>{tournament.match_type}</span>
          </div>

          {/* Status Indicator */}
          <div>
            {tournament.status === 'LIVE' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/90 text-white font-black text-[11px] tracking-wider uppercase shadow-lg shadow-red-900/50 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                LIVE MATCH
              </span>
            )}
            {tournament.status === 'OPEN' && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white font-bold text-[11px] tracking-wider uppercase">
                REGISTRATION OPEN
              </span>
            )}
            {tournament.status === 'UPCOMING' && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-600/90 text-white font-bold text-[11px] tracking-wider uppercase">
                UPCOMING
              </span>
            )}
            {tournament.status === 'COMPLETED' && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px] tracking-wider uppercase border border-slate-700">
                COMPLETED
              </span>
            )}
            {tournament.status === 'CANCELLED' && (
              <span className="px-2.5 py-1 rounded-lg bg-red-950 text-red-400 font-bold text-[11px] tracking-wider uppercase border border-red-800">
                CANCELLED
              </span>
            )}
          </div>
        </div>

        {/* User Registered Tag */}
        {registered && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Joined (Slot #{participantInfo?.slot_number})</span>
          </div>
        )}

        {/* Map Name */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md">
          <MapPin className="w-3 h-3 text-rose-400" />
          <span>{tournament.game_map}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
            {tournament.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-1">
            {tournament.description}
          </p>
        </div>

        {/* Prize Pool & Entry Fee Metrics */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Pool</div>
            <div className="text-sm font-black text-rose-400">৳ {tournament.prize_pool}</div>
          </div>
          <div className="border-x border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Per Kill</div>
            <div className="text-sm font-black text-amber-400">
              {tournament.per_kill_prize > 0 ? `৳ ${tournament.per_kill_prize}` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Entry Fee</div>
            <div className="text-sm font-black text-white">
              {tournament.entry_fee > 0 ? `৳ ${tournament.entry_fee}` : 'FREE'}
            </div>
          </div>
        </div>

        {/* Slots & Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Users className="w-3.5 h-3.5 text-rose-500" />
              <span>Slots</span>
            </span>
            <span className="text-slate-400 text-[11px] font-medium">
              <strong className="text-white font-bold">{tournament.registered_count}</strong> / {tournament.max_slots} (
              {tournament.max_slots - tournament.registered_count} left)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull
                  ? 'bg-red-500'
                  : slotPercent > 70
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-red-600 to-purple-600'
              }`}
              style={{ width: `${slotPercent}%` }}
            />
          </div>
        </div>

        {/* Match Time & CTA Button */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div>
            {tournament.status === 'LIVE' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(tournament);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/40 flex items-center gap-1 transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Room ID</span>
              </button>
            ) : registered ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(tournament);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-colors"
              >
                View Details
              </button>
            ) : tournament.status === 'OPEN' && !isFull ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onQuickJoin) onQuickJoin(tournament);
                  else onSelect(tournament);
                }}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Join (৳{tournament.entry_fee})
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(tournament);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                {isFull ? 'Full · View' : 'Details'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
