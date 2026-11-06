import React, { useState } from 'react';
import { Tournament } from '../../types';
import { useTournaments } from '../../context/TournamentContext';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { X, Swords, AlertCircle, ShieldCheck, Wallet, ArrowRight, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit: () => void;
}

export const JoinConfirmationModal: React.FC<Props> = ({ tournament, isOpen, onClose, onOpenDeposit }) => {
  const { user } = useAuth();
  const { balance } = useWallet();
  const { joinTournament } = useTournaments();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !tournament) return null;

  const hasEnoughBalance = balance >= tournament.entry_fee;

  const handleConfirm = () => {
    if (!user) return;
    setErrorMsg('');
    setLoading(true);

    const res = joinTournament(tournament.id);
    setLoading(false);

    if (res.success) {
      // Trigger esports confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#a855f7', '#fbbf24']
      });

      showToast('Registration Confirmed!', res.message, 'success');
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#121520] border border-rose-950/80 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 p-0.5 shadow-lg shadow-rose-950/60 mb-2">
            <div className="w-full h-full bg-[#0b0d14] rounded-[10px] flex items-center justify-center">
              <Swords className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <h3 className="text-lg font-black text-white">Confirm Tournament Entry</h3>
          <p className="text-xs text-slate-400 mt-0.5">{tournament.title}</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-3.5 mb-5 text-xs">
          {/* Gamer Profile Validation */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block">Player Free Fire Profile</span>
                <span className="font-bold text-white font-mono">{user?.ff_name}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Player UID</span>
              <span className="font-mono text-slate-300 font-semibold">{user?.ff_uid}</span>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Entry Fee:</span>
              <span className="font-extrabold text-white">৳ {tournament.entry_fee} BDT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Available Wallet Balance:</span>
              <span className={`font-bold ${hasEnoughBalance ? 'text-emerald-400' : 'text-red-400'}`}>
                ৳ {balance.toFixed(0)} BDT
              </span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Balance After Entry:</span>
              <span className="font-black text-rose-400">
                ৳ {Math.max(0, balance - tournament.entry_fee).toFixed(0)} BDT
              </span>
            </div>
          </div>

          {/* Insufficient Funds Warning */}
          {!hasEnoughBalance && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Insufficient Wallet Balance</span>
              </div>
              <p className="text-[11px] text-amber-300/80 leading-normal">
                You need ৳ {(tournament.entry_fee - balance).toFixed(0)} more to join this match. Add money quickly via Nagad.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Wallet className="w-3.5 h-3.5" />
                Deposit Money Now
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Cancel
          </button>
          <button
            disabled={!hasEnoughBalance || loading}
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg ${
              hasEnoughBalance && !loading
                ? 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white shadow-rose-950/50 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Processing...' : `Confirm (৳${tournament.entry_fee})`}
          </button>
        </div>
      </div>
    </div>
  );
};
