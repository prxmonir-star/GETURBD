import React, { useState } from 'react';
import { PaymentMethod } from '../../types';
import { useWallet } from '../../context/WalletContext';
import { storage } from '../../services/storage';
import { useNotifications } from '../../context/NotificationContext';
import { X, ArrowDownRight, AlertCircle, Clock, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { balance, withdrawMoney } = useWallet();
  const { showToast } = useNotifications();
  const settings = storage.getSettings();

  const enabledMethods: PaymentMethod[] = [];
  if (settings.nagad_enabled) enabledMethods.push('Nagad');
  if (settings.bkash_enabled) enabledMethods.push('bKash');
  if (settings.rocket_enabled) enabledMethods.push('Rocket');

  const [method, setMethod] = useState<PaymentMethod>(
    enabledMethods[0] || 'Nagad'
  );
  const [accountType, setAccountType] = useState<'Personal' | 'Agent'>('Personal');
  const [amount, setAmount] = useState<number>(100);
  const [receiverNumber, setReceiverNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount < settings.min_withdrawal) {
      setErrorMsg(`Minimum withdrawal limit is ৳ ${settings.min_withdrawal}.`);
      return;
    }

    if (amount > balance) {
      setErrorMsg(`Insufficient funds. Your available balance is ৳ ${balance}.`);
      return;
    }

    if (!receiverNumber || receiverNumber.trim().length < 11) {
      setErrorMsg('Please enter a valid 11-digit mobile banking account number.');
      return;
    }

    setLoading(true);
    const res = withdrawMoney(method, amount, receiverNumber, accountType);
    setLoading(false);

    if (res.success) {
      showToast('Withdrawal Submitted', res.message, 'success');
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-[#121520] border border-rose-950/80 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-purple-600 p-0.5 shadow-lg shadow-rose-950/60 mb-2">
            <div className="w-full h-full bg-[#0b0d14] rounded-[10px] flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <h3 className="text-lg font-black text-white">Withdraw Tournament Winnings</h3>
          <p className="text-xs text-slate-400 mt-0.5">Fast Payout to bKash / Nagad / Rocket</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Current Balance Card */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Available to Withdraw:</span>
          <span className="text-base font-black text-emerald-400">৳ {balance.toFixed(2)} BDT</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Method Selection */}
          {enabledMethods.length > 1 ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Payout Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {enabledMethods.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      method === m
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-amber-500/30">
              <span className="text-xs text-slate-300 font-semibold">
                Payout Gateway: <strong className="text-amber-400">Nagad</strong>
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ENABLED
              </span>
            </div>
          )}

          {/* Account Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccountType('Personal')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  accountType === 'Personal'
                    ? 'bg-slate-800 border-purple-500 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Personal Account
              </button>
              <button
                type="button"
                onClick={() => setAccountType('Agent')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  accountType === 'Agent'
                    ? 'bg-slate-800 border-purple-500 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                Agent Account
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Amount to Withdraw (Min: ৳{settings.min_withdrawal})
              </label>
              <button
                type="button"
                onClick={() => setAmount(balance)}
                className="text-[11px] text-rose-400 hover:underline font-semibold"
              >
                Max All (৳{balance.toFixed(0)})
              </button>
            </div>
            <input
              type="number"
              min={settings.min_withdrawal}
              max={balance}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 font-bold"
            />
          </div>

          {/* Recipient Account Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {method} {accountType} Number
            </label>
            <input
              type="tel"
              required
              value={receiverNumber}
              onChange={(e) => setReceiverNumber(e.target.value)}
              placeholder="017xxxxxxxx"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          {/* Processing Time Note */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Withdrawals are verified and disbursed via authorized merchant channels within 1 to 2 hours.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || balance < settings.min_withdrawal}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 ${
              balance >= settings.min_withdrawal && !loading
                ? 'bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white shadow-rose-950/50 hover:scale-[1.01] active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            {loading ? 'Submitting...' : `Withdraw ৳${amount}`}
          </button>
        </form>
      </div>
    </div>
  );
};
