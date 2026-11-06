import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { 
  User, 
  Gamepad2, 
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  Save, 
  Smartphone, 
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
];

interface Props {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const ProfileView: React.FC<Props> = ({ onOpenDeposit, onOpenWithdraw }) => {
  const { user, updateProfile, switchUser, toggleAdminRole, logout, allProfiles, isAdmin } = useAuth();
  const { balance } = useWallet();
  const { showToast } = useNotifications();

  const [ffName, setFfName] = useState(user?.ff_name || '');
  const [ffUid, setFfUid] = useState(user?.ff_uid || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || AVATAR_OPTIONS[0]);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="p-12 text-center rounded-2xl bg-[#121520] border border-slate-800">
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Please Sign In</h3>
        <p className="text-xs text-slate-400">Sign in to manage your Free Fire profile.</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateProfile({
      ff_name: ffName.trim(),
      ff_uid: ffUid.trim(),
      phone_number: phoneNumber.trim(),
      avatar_url: selectedAvatar
    });
    if (res.success) {
      showToast('Profile Updated', 'Your gaming credentials have been saved.', 'success');
      setIsEditing(false);
    } else {
      showToast('Error', res.message, 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
            Player Profile & Settings
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Your Free Fire credentials used for tournament match registration and prize disbursement.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-3xl bg-[#121520] border border-slate-800 p-6 sm:p-8 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url}
              alt={user.ff_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-rose-500/50 shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{user.full_name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isAdmin ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {isAdmin ? '🛡️ Admin' : 'Player'}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-rose-400">IGN: {user.ff_name}</div>
              <div className="text-xs text-slate-400 font-mono">Free Fire UID: {user.ff_uid}</div>
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto p-3 sm:p-0 rounded-xl bg-slate-900/60 sm:bg-transparent border sm:border-0 border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wallet Balance</span>
            <span className="text-2xl font-black text-white">৳ {balance.toFixed(0)} BDT</span>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Free Fire Game Information
            </h3>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                Edit Details
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Free Fire In-Game Name (IGN)
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={ffName}
                onChange={(e) => setFfName(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold ${
                  isEditing
                    ? 'bg-slate-900 border-rose-500/50 text-white focus:outline-none'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Free Fire Player UID
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={ffUid}
                onChange={(e) => setFfUid(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold ${
                  isEditing
                    ? 'bg-slate-900 border-rose-500/50 text-white focus:outline-none'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Phone Number (bKash/Nagad)
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs ${
                  isEditing
                    ? 'bg-slate-900 border-rose-500/50 text-white focus:outline-none'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Avatar Selector if Editing */}
          {isEditing && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Esports Avatar
              </label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {AVATAR_OPTIONS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="avatar option"
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-12 h-12 rounded-xl object-cover cursor-pointer transition border-2 ${
                      selectedAvatar === url ? 'border-rose-500 scale-105' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white text-xs font-bold uppercase transition flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Registered User Accounts */}
      <div className="p-5 rounded-2xl bg-[#121520] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Registered Gamer Accounts ({allProfiles.length})
          </span>
          <button
            onClick={toggleAdminRole}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Switch Role ({isAdmin ? 'Admin' : 'User'})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {allProfiles.map((p) => (
            <button
              key={p.id}
              onClick={() => switchUser(p.id)}
              className={`p-3 rounded-xl border text-left transition ${
                user.id === p.id
                  ? 'bg-rose-950/40 border-rose-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-xs truncate">{p.ff_name}</div>
              <div className="text-[10px] text-slate-400 capitalize">{p.role} · {p.full_name.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* App & Device Info Card */}
      <div className="p-5 rounded-2xl bg-[#121520] border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-rose-500" />
          <div>
            <strong className="text-white block">FF TOURNAMENT PRO PWA</strong>
            <span className="text-slate-400">Installable Progressive Web App for Android & Desktop</span>
          </div>
        </div>
        <PWAInstallButton variant="header" />
      </div>

      {/* Logout */}
      <div className="pt-2 text-center">
        <button
          onClick={logout}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 text-xs font-bold border border-slate-800 transition flex items-center gap-2 mx-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};
