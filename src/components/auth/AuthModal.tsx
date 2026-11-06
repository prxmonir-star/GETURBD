import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { X, LogIn, UserPlus, KeyRound, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register, requestPasswordReset, switchUser } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFfName, setRegFfName] = useState('');
  const [regFfUid, setRegFfUid] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = login(loginEmail, loginPassword);
    if (res.success) {
      showToast('Login Successful', res.message, 'success');
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regFullName || !regEmail || !regFfName || !regFfUid || !regPhone) {
      setErrorMsg('Please fill in all required registration fields.');
      return;
    }

    if (regFfUid.length < 7) {
      setErrorMsg('Free Fire UID is typically 8-10 digits long.');
      return;
    }

    const res = register({
      full_name: regFullName,
      email: regEmail,
      password: regPassword,
      ff_name: regFfName,
      ff_uid: regFfUid,
      phone_number: regPhone
    });

    if (res.success) {
      showToast('Registration Complete', res.message, 'success');
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = requestPasswordReset(forgotEmail);
    if (res.success) {
      setForgotSent(true);
      showToast('Reset Link Sent', res.message, 'info');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-[#121520] border border-rose-950/70 shadow-2xl p-6 text-slate-100 relative animate-in fade-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-purple-600 p-0.5 shadow-lg shadow-rose-950/50 mb-3">
            <div className="w-full h-full bg-[#0b0d14] rounded-[10px] flex items-center justify-center font-black text-rose-500 text-lg">
              FF
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wide">
            {activeTab === 'login' && 'Sign in to FF PRO'}
            {activeTab === 'register' && 'Create Gamer Account'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Free Fire Bangladesh Esports Tournament Network
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-5">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors text-center border-b-2 ${
              activeTab === 'login'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors text-center border-b-2 ${
              activeTab === 'register'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setActiveTab('forgot'); setErrorMsg(''); }}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors text-center border-b-2 ${
              activeTab === 'forgot'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Forgot
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-rose-950/50 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Arena
            </button>

            {/* Quick Admin Access */}
            <div className="pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@ffpro.com');
                  setLoginPassword('admin123');
                }}
                className="w-full py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 text-xs font-semibold border border-purple-800/40 transition flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Fill Tournament Director Credentials (Admin)
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Tanvir Rahman"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tanvir@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Free Fire IGN (Name)
                </label>
                <input
                  type="text"
                  required
                  value={regFfName}
                  onChange={(e) => setRegFfName(e.target.value)}
                  placeholder="e.g. GALAXY_OP"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Free Fire UID
                </label>
                <input
                  type="text"
                  required
                  value={regFfUid}
                  onChange={(e) => setRegFfUid(e.target.value)}
                  placeholder="e.g. 192837465"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number (bKash/Nagad for Prizes)
              </label>
              <input
                type="tel"
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official Free Fire UID will be verified in custom tournament rooms.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-rose-950/50 transition-transform active:scale-[0.98]"
            >
              Complete Registration
            </button>
          </form>
        )}

        {/* TAB 3: FORGOT PASSWORD */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            {forgotSent ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">Reset Instructions Sent</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  We sent password recovery instructions to <strong>{forgotEmail}</strong>. Please check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter the email address registered with your FF PRO gamer account and we will dispatch a reset link.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Send Password Reset Link
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
