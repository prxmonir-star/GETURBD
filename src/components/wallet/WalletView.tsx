import React, { useState } from 'react';
import { Transaction, TransactionType } from '../../types';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { TransactionReceiptModal } from './TransactionReceiptModal';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowDownRight, 
  ArrowUpRight, 
  Trophy, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface Props {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const WalletView: React.FC<Props> = ({ onOpenDeposit, onOpenWithdraw }) => {
  const { user } = useAuth();
  const { balance, transactions, userDeposits, userWithdrawals } = useWallet();

  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  if (!user) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#121520] border border-slate-800">
        <WalletIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Sign In to Access Your Wallet</h3>
        <p className="text-xs text-slate-400">
          Manage your funds, add money via Nagad, and withdraw prizes.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalPrizes = transactions
    .filter(t => t.type === 'PRIZE_MONEY' && t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDeposited = transactions
    .filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalWithdrawn = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const pendingDeposits = userDeposits.filter(d => d.status === 'PENDING');
  const pendingWithdrawals = userWithdrawals.filter(w => w.status === 'PENDING');

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
            Gamer Esports Wallet
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Secure multi-currency wallet with instant mobile banking deposits and verified withdrawals.
        </p>
      </div>

      {/* Main Balance Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#171a29] to-[#0e1017] border border-rose-950/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rose-900/10 to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Available Cash Balance
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white flex items-baseline gap-2">
              <span className="text-rose-500">৳</span>
              <span>{balance.toFixed(2)}</span>
              <span className="text-sm font-semibold text-slate-400">BDT</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Immutable Ledger Protected · 100% Payout Guarantee</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDeposit}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Money
            </button>
            <button
              onClick={onOpenWithdraw}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Mini Financial Stats Summary */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800/80 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Deposited</div>
            <div className="text-sm sm:text-base font-black text-white mt-0.5">৳ {totalDeposited}</div>
          </div>
          <div className="border-x border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Prize Earnings</div>
            <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">৳ {totalPrizes}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Withdrawn</div>
            <div className="text-sm sm:text-base font-black text-rose-400 mt-0.5">৳ {totalWithdrawn}</div>
          </div>
        </div>
      </div>

      {/* Pending Requests Alert Banners (if any) */}
      {(pendingDeposits.length > 0 || pendingWithdrawals.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pending Processing Requests
          </h3>

          {pendingDeposits.map((d) => (
            <div
              key={d.id}
              className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs text-amber-200"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <strong className="text-white block">
                    Deposit of ৳ {d.amount} via {d.method} Under Review
                  </strong>
                  <span className="text-[11px] text-amber-300/80 font-mono">TrxID: {d.transaction_id}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                Verifying
              </span>
            </div>
          ))}

          {pendingWithdrawals.map((w) => (
            <div
              key={w.id}
              className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <strong className="text-white block">
                    Withdrawal of ৳ {w.amount} to {w.receiver_number} ({w.method})
                  </strong>
                  <span className="text-[11px] text-purple-300/80">Disbursing within 1-2 hours</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                In Queue
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Transactions History Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Transaction History ({filteredTransactions.length})
          </h3>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'ENTRY_FEE', 'PRIZE_MONEY', 'REFUND'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[10px] ${
                  filterType === type
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="rounded-2xl bg-[#121520] border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-xl">
          {filteredTransactions.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No transactions found in this category.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : tx.type === 'PRIZE_MONEY'
                          ? 'bg-amber-500/10 text-amber-400'
                          : tx.type === 'REFUND'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' && <ArrowDownRight className="w-4 h-4" />}
                      {tx.type === 'PRIZE_MONEY' && <Trophy className="w-4 h-4" />}
                      {tx.type === 'REFUND' && <RotateCcw className="w-4 h-4" />}
                      {tx.type === 'ENTRY_FEE' && <ArrowUpRight className="w-4 h-4" />}
                      {tx.type === 'WITHDRAWAL' && <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">{tx.description}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>
                          {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>·</span>
                        <span className="font-mono">{tx.id.substring(0, 14)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-black ${isCredit ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {isCredit ? `+৳ ${tx.amount}` : `-৳ ${Math.abs(tx.amount)}`}
                    </div>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {tx.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
};
