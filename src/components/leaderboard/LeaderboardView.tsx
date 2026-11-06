import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../services/storage';
import { Trophy, Crosshair, Crown, Flame, Award, Shield } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { allProfiles } = useAuth();
  const [metric, setMetric] = useState<'earnings' | 'kills' | 'wins'>('earnings');

  const profiles = [...allProfiles].filter(p => !p.is_blocked);

  const sortedProfiles = profiles.sort((a, b) => {
    const statsA = a.stats || { matches_played: 0, wins: 0, kills: 0, total_earnings: 0 };
    const statsB = b.stats || { matches_played: 0, wins: 0, kills: 0, total_earnings: 0 };

    if (metric === 'earnings') return statsB.total_earnings - statsA.total_earnings;
    if (metric === 'kills') return statsB.kills - statsA.kills;
    return statsB.wins - statsA.wins;
  });

  const hasAnyActivity = sortedProfiles.some(p => (p.stats?.matches_played || 0) > 0 || (p.stats?.total_earnings || 0) > 0);

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
              Hall of Champions
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Top performing Free Fire esports players ranked by earnings, frags, and booyahs.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setMetric('earnings')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] flex items-center gap-1.5 ${
              metric === 'earnings' ? 'bg-amber-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Top Earners (৳)
          </button>
          <button
            onClick={() => setMetric('kills')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] flex items-center gap-1.5 ${
              metric === 'kills' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            Top Fraggers
          </button>
          <button
            onClick={() => setMetric('wins')}
            className={`px-3 py-1.5 rounded-lg font-bold transition text-[11px] flex items-center gap-1.5 ${
              metric === 'wins' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Most Booyahs
          </button>
        </div>
      </div>

      {!hasAnyActivity && (
        <div className="p-8 text-center rounded-2xl bg-[#121520] border border-slate-800 space-y-2">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Tournament Matches Concluded Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Rankings and podium standings will update automatically as soon as official matches finish and winners are declared.
          </p>
        </div>
      )}

      {hasAnyActivity && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 */}
          {sortedProfiles[1] && (
            <div className="order-2 sm:order-1 rounded-2xl bg-[#121520] border border-slate-700/60 p-5 text-center flex flex-col items-center justify-between shadow-xl">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center mb-2">
                #2
              </div>
            <img
              src={sortedProfiles[1].avatar_url}
              alt={sortedProfiles[1].ff_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-400 mb-2 shadow-lg"
            />
            <div className="font-extrabold text-white text-sm">{sortedProfiles[1].ff_name}</div>
            <div className="text-[11px] text-slate-400 font-mono">UID: {sortedProfiles[1].ff_uid}</div>
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 w-full">
              <span className="text-[10px] text-slate-400 block uppercase">
                {metric === 'earnings' ? 'Total Winnings' : metric === 'kills' ? 'Total Kills' : 'Wins'}
              </span>
              <span className="text-base font-black text-slate-200">
                {metric === 'earnings' ? `৳ ${sortedProfiles[1].stats?.total_earnings}` : metric === 'kills' ? `${sortedProfiles[1].stats?.kills} Kills` : `${sortedProfiles[1].stats?.wins} Wins`}
              </span>
            </div>
          </div>
        )}

        {/* Rank 1 - Champion */}
        {sortedProfiles[0] && (
          <div className="order-1 sm:order-2 rounded-2xl bg-gradient-to-b from-amber-950/40 via-[#141724] to-[#121520] border border-amber-500/50 p-6 text-center flex flex-col items-center justify-between shadow-2xl relative">
            <div className="absolute -top-3 w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-950/60">
              <Crown className="w-4 h-4 fill-slate-950" />
            </div>
            <div className="text-[10px] font-black text-amber-400 tracking-wider uppercase mt-1">
              GRANDMASTER CHAMPION
            </div>
            <img
              src={sortedProfiles[0].avatar_url}
              alt={sortedProfiles[0].ff_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 my-2 shadow-xl shadow-amber-950/50"
            />
            <div className="font-black text-white text-base">{sortedProfiles[0].ff_name}</div>
            <div className="text-[11px] text-slate-400 font-mono">UID: {sortedProfiles[0].ff_uid}</div>
            <div className="mt-3 py-2 px-4 rounded-xl bg-amber-950/50 border border-amber-500/30 w-full">
              <span className="text-[10px] text-amber-300 block uppercase font-semibold">
                {metric === 'earnings' ? 'Total Winnings' : metric === 'kills' ? 'Total Kills' : 'Wins'}
              </span>
              <span className="text-lg font-black text-amber-400">
                {metric === 'earnings' ? `৳ ${sortedProfiles[0].stats?.total_earnings}` : metric === 'kills' ? `${sortedProfiles[0].stats?.kills} Kills` : `${sortedProfiles[0].stats?.wins} Wins`}
              </span>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {sortedProfiles[2] && (
          <div className="order-3 sm:order-3 rounded-2xl bg-[#121520] border border-amber-900/40 p-5 text-center flex flex-col items-center justify-between shadow-xl">
            <div className="w-8 h-8 rounded-full bg-amber-900/80 text-amber-300 font-black text-xs flex items-center justify-center mb-2">
              #3
            </div>
            <img
              src={sortedProfiles[2].avatar_url}
              alt={sortedProfiles[2].ff_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-700 mb-2 shadow-lg"
            />
            <div className="font-extrabold text-white text-sm">{sortedProfiles[2].ff_name}</div>
            <div className="text-[11px] text-slate-400 font-mono">UID: {sortedProfiles[2].ff_uid}</div>
            <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 w-full">
              <span className="text-[10px] text-slate-400 block uppercase">
                {metric === 'earnings' ? 'Total Winnings' : metric === 'kills' ? 'Total Kills' : 'Wins'}
              </span>
              <span className="text-base font-black text-amber-600">
                {metric === 'earnings' ? `৳ ${sortedProfiles[2].stats?.total_earnings}` : metric === 'kills' ? `${sortedProfiles[2].stats?.kills} Kills` : `${sortedProfiles[2].stats?.wins} Wins`}
              </span>
            </div>
          </div>
        )}
      </div>
    )}

      {/* Leaderboard Full Table */}
      <div className="rounded-2xl bg-[#121520] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Rank & Player</span>
          <div className="flex items-center gap-8">
            <span className="hidden sm:inline">Matches</span>
            <span className="hidden sm:inline">Kills</span>
            <span>Winnings</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {sortedProfiles.map((p, idx) => {
            const rank = idx + 1;
            const stats = p.stats || { matches_played: 0, wins: 0, kills: 0, total_earnings: 0 };
            return (
              <div
                key={p.id}
                className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-6 text-center font-black text-xs ${
                    rank === 1 ? 'text-amber-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{rank}
                  </span>
                  <img
                    src={p.avatar_url}
                    alt={p.ff_name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{p.ff_name}</span>
                      {rank <= 3 && <Flame className="w-3 h-3 text-rose-500 fill-rose-500/20" />}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">UID: {p.ff_uid}</div>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-xs">
                  <span className="hidden sm:inline text-slate-300 font-semibold">{stats.matches_played}</span>
                  <span className="hidden sm:inline text-rose-400 font-bold">{stats.kills}</span>
                  <span className="font-black text-emerald-400 text-right min-w-[70px]">
                    ৳ {stats.total_earnings}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
