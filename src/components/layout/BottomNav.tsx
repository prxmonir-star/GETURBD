import React from 'react';
import { Home, Swords, Gamepad2, Wallet, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onSelectTab }) => {
  const { isAdmin } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d14]/95 backdrop-blur-lg border-t border-slate-800/80 md:hidden pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            currentTab === 'home' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* Tournaments */}
        <button
          onClick={() => onSelectTab('tournaments')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            currentTab === 'tournaments' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Tourneys</span>
        </button>

        {/* My Matches */}
        <button
          onClick={() => onSelectTab('matches')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            currentTab === 'matches' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Matches</span>
        </button>

        {/* Wallet */}
        <button
          onClick={() => onSelectTab('wallet')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            currentTab === 'wallet' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-tight">Wallet</span>
        </button>

        {/* Profile / Admin */}
        <button
          onClick={() => onSelectTab(isAdmin ? 'admin' : 'profile')}
          className={`flex flex-col items-center justify-center gap-1 h-full py-1 transition-colors ${
            currentTab === 'profile' || currentTab === 'admin' ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAdmin ? (
            <>
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] font-bold tracking-tight text-purple-400">Admin</span>
            </>
          ) : (
            <>
              <User className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight">Profile</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
