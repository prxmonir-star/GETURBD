import React, { useState } from 'react';
import { Tournament, MatchType, TournamentStatus } from '../../types';
import { useTournaments } from '../../context/TournamentContext';
import { TournamentCard } from './TournamentCard';
import { Search, Filter, Swords, RefreshCw } from 'lucide-react';

interface Props {
  onSelectTournament: (t: Tournament) => void;
  onQuickJoin: (t: Tournament) => void;
}

export const TournamentsListView: React.FC<Props> = ({ onSelectTournament, onQuickJoin }) => {
  const { tournaments, refreshTournaments } = useTournaments();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MatchType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TournamentStatus>('ALL');
  const [mapFilter, setMapFilter] = useState<string>('ALL');

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.game_map.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.match_type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesMap = mapFilter === 'ALL' || t.game_map === mapFilter;

    return matchesSearch && matchesType && matchesStatus && matchesMap;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              Tournament Arena
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a Free Fire match, join with your squad, and battle for the prize pool!
          </p>
        </div>

        <button
          onClick={refreshTournaments}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#121520] border border-slate-800/80 space-y-3.5 shadow-xl">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tournaments by name or map..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Match Type Filters */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            {(['ALL', 'SOLO', 'DUO', 'SQUAD'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] ${
                  typeFilter === type
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            {(['ALL', 'OPEN', 'LIVE', 'COMPLETED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] ${
                  statusFilter === status
                    ? 'bg-rose-950 border border-rose-500/40 text-rose-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Map Selector */}
          <select
            value={mapFilter}
            onChange={(e) => setMapFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Maps</option>
            <option value="Bermuda">Bermuda</option>
            <option value="Purgatory">Purgatory</option>
            <option value="Kalahari">Kalahari</option>
            <option value="Alpine">Alpine</option>
            <option value="Nexterra">Nexterra</option>
          </select>
        </div>
      </div>

      {/* Tournaments Grid */}
      {tournaments.length === 0 ? (
        <div className="p-14 text-center rounded-2xl bg-[#121520] border border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Swords className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-white">No Tournament Available</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Admin has not created any tournament yet.
          </p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121520] border border-slate-800">
          <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Tournaments Match Your Filter</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query, map filter, or match type.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onSelect={onSelectTournament}
              onQuickJoin={onQuickJoin}
            />
          ))}
        </div>
      )}
    </div>
  );
};
