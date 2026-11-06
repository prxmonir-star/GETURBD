import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
import { useWallet } from '../../context/WalletContext';
import { storage } from '../../services/storage';
import { useNotifications } from '../../context/NotificationContext';
import { X, Copy, Check, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { depositMoney } = useWallet();
  const { showToast } = useNotifications();
  const settings = storage.getSettings();

  // Filter only enabled payment methods from settings
  // bKash and Rocket are disabled by default; Nagad is enabled
  const enabledMethods: { method: PaymentMethod; name: string; number: string; badgeColor: string }[] = [];
  
  if (settings.nagad_enabled) {
    enabledMethods.push({
      method: 'Nagad',
      name: 'Nagad',
      number: settings.nagad_number || '01970246557',
      badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300'
    });
  }
  if (settings.bkash_enabled) {
    enabledMethods.push({
      method: 'bKash',
      name: 'bKash',
      number: settings.bkash_number,
      badgeColor: 'border-rose-500/50 bg-rose-950/40 text-rose-300'
    });
  }
  if (settings.rocket_enabled) {
    enabledMethods.push({
      method: 'Rocket',
      name: 'Rocket',
      number: settings.rocket_number,
      badgeColor: 'border-purple-500/50 bg-purple-950/40 text-purple-300'
    });
  }

  // Ensure default selected method is the first enabled method (Nagad)
  const [method, setMethod] = useState<PaymentMethod>(
    enabledMethods[0]?.method || 'Nagad'
  );

  useEffect(() => {
    if (enabledMethods.length > 0 && !enabledMethods.some(m => m.method === method)) {
      setMethod(enabledMethods[0].method);
    }
  }, [settings.nagad_enabled, settings.bkash_enabled, settings.rocket_enabled]);

  const [amount, setAmount] = useState<number>(100);
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentMethodConfig = enabledMethods.find(m => m.method === method);
  const targetNumber = currentMethodConfig?.number || settings.nagad_number || '01970246557';

  const copyNumber = () => {
    navigator.clipboard.writeText(targetNumber);
    setCopied(true);
    const msg = `${method} Number copied: ${targetNumber}`;
    setCopySuccessMessage(msg);
    showToast('Number Copied', msg, 'success');
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount < settings.min_deposit) {
      setErrorMsg(`Minimum deposit amount is ৳ ${settings.min_deposit}.`);
      return;
    }

    if (!senderNumber || senderNumber.length < 11) {
      setErrorMsg(`Please enter a valid 11-digit ${method} sender phone number.`);
      return;
    }

    if (!trxId || trxId.trim().length < 6) {
      setErrorMsg('Please enter a valid Transaction ID (TrxID) from your mobile banking app.');
      return;
    }

    setLoading(true);
    const res = depositMoney(method, amount, senderNumber, trxId);
    setLoading(false);

    if (res.success) {
      showToast('Deposit Submitted', res.message, 'success');
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-[#121520] border border-amber-950/80 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-950/60 mb-2">
            <div className="w-full h-full bg-[#0b0d14] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-lg">
              ৳
            </div>
          </div>
          <h3 className="text-lg font-black text-white">Add Money to Wallet</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {enabledMethods.length === 1 && method === 'Nagad' 
              ? 'Instant Deposit via Nagad (Personal)' 
              : 'Instant Deposit via Mobile Banking'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Copy Success Feedback Banner */}
        {copySuccessMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{copySuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Method Selection: Only show selector if MORE THAN 1 method is enabled.
              When bKash and Rocket are disabled, only Nagad exists and disabled methods are completely hidden. */}
          {enabledMethods.length > 1 ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Active Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {enabledMethods.map((m) => (
                  <button
                    key={m.method}
                    type="button"
                    onClick={() => setMethod(m.method)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                      method === m.method
                        ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] font-normal text-slate-400">Personal</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Nagad Active Badge when only Nagad is enabled */
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <div>
                  <div className="text-xs font-black text-white">Payment Method: Nagad</div>
                  <div className="text-[10px] text-amber-400/90 font-medium">Personal (Send Money)</div>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                ACTIVE
              </span>
            </div>
          )}

          {/* Official Nagad Number with Copy Number Button */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                Official {method} Number (Send Money):
              </span>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                Personal
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/70 border border-slate-800">
              <span className="font-mono text-base sm:text-lg font-black text-amber-400 tracking-wider">
                {targetNumber}
              </span>
              <button
                type="button"
                onClick={copyNumber}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md shadow-amber-950/60'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Number'}</span>
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="text-[11px] text-slate-400 pt-1 space-y-0.5">
              <p className="text-slate-300 font-semibold">How to deposit:</p>
              <p>1. Open your <strong className="text-amber-400">{method}</strong> app or dial *167#</p>
              <p>2. Select <strong className="text-slate-200">Send Money</strong> to: <strong className="text-amber-300 font-mono">{targetNumber}</strong></p>
              <p>3. Copy the <strong className="text-slate-200">Transaction ID (TrxID)</strong> and submit below.</p>
            </div>
          </div>

          {/* Amount Quick Chips & Custom Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deposit Amount (৳ BDT)
            </label>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {[50, 100, 200, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    amount === val
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ৳{val}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={settings.min_deposit}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
            />
          </div>

          {/* Sender Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your {method} Sender Number
            </label>
            <input
              type="tel"
              required
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="019xxxxxxxx"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Transaction ID (TrxID)
            </label>
            <input
              type="text"
              required
              value={trxId}
              onChange={(e) => setTrxId(e.target.value)}
              placeholder="e.g. 9JK83N201"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 uppercase font-mono tracking-wider"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Verifying...' : `Submit Deposit (৳${amount})`}
          </button>
        </form>
      </div>
    </div>
  );
};
