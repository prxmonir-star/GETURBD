import React from 'react';
import { Transaction } from '../../types';
import { X, CheckCircle, Clock, AlertTriangle, Copy, Receipt, Share2 } from 'lucide-react';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<Props> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isCredit = transaction.amount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#121520] border border-rose-950/70 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Voucher Header */}
        <div className="text-center pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center mb-2 shadow-inner">
            <Receipt className="w-6 h-6 text-rose-500" />
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
            FF PRO Official Voucher
          </span>
          <div className={`text-2xl font-black mt-1 ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isCredit ? `+৳ ${transaction.amount}` : `-৳ ${Math.abs(transaction.amount)}`}
          </div>
          <p className="text-xs text-slate-300 font-medium mt-0.5">{transaction.description}</p>
        </div>

        {/* Voucher Body Details */}
        <div className="py-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status</span>
            <div>
              {transaction.status === 'COMPLETED' && (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Completed
                </span>
              )}
              {transaction.status === 'PENDING' && (
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  Under Review
                </span>
              )}
              {transaction.status === 'REVERSED' && (
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reversed / Refunded
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Transaction Type</span>
            <span className="font-semibold text-white uppercase">{transaction.type.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Transaction ID</span>
            <span className="font-mono text-slate-300">{transaction.id}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Date & Time</span>
            <span className="text-slate-300">
              {new Date(transaction.created_at).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Balance Before</span>
              <span>৳ {transaction.balance_before.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-white">
              <span>Balance After</span>
              <span className="text-rose-400">৳ {transaction.balance_after.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
          >
            Close Voucher
          </button>
        </div>
      </div>
    </div>
  );
};
