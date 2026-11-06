import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { 
  Bell, 
  Wallet as WalletIcon, 
  ShieldAlert, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  Swords, 
  Trophy, 
  Gamepad2, 
  Flame
} from 'lucide-react';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenDeposit: () => void;
}

export const Header: React.FC<Props> = ({ currentTab, onSelectTab, onOpenAuth, onOpenDeposit }) => {
  const { user, isAuthenticated, isAdmin, logout, toggleAdminRole } = useAuth();
  const { balance } = useWallet();
  const { notifications, unreadCount, markAsRead, markAllAsRead, requestPushPermissions } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0b0d14]/90 backdrop-blur-md border-b border-rose-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-purple-600 p-0.5 shadow-lg shadow-rose-950/60 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b0d14] rounded-[10px] flex items-center justify-center">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500/30 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-white bg-clip-text">
                FF<span className="text-rose-500">PRO</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                ESPORTS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-tight hidden sm:block">Tournament Platform BD</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'home'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('tournaments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'tournaments'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            Tournaments
          </button>
          <button
            onClick={() => onSelectTab('matches')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'matches'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            My Matches
          </button>
          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'leaderboard'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
          <button
            onClick={() => onSelectTab('wallet')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              currentTab === 'wallet'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <WalletIcon className="w-3.5 h-3.5" />
            Wallet
          </button>
          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-900/40'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 border border-purple-800/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin Panel
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {isAuthenticated ? (
            <>
              {/* Wallet Balance Pill */}
              <div 
                onClick={() => onSelectTab('wallet')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-colors shadow-inner"
                title="View wallet & transactions"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ৳
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 font-medium leading-none">Balance</div>
                  <div className="text-xs font-extrabold text-white">৳ {balance.toFixed(0)}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDeposit();
                  }}
                  className="w-5 h-5 rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors ml-1"
                  title="Add Money"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#121520] border border-rose-950/60 shadow-2xl p-4 z-50 text-slate-100 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-500" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-semibold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          onClick={markAllAsRead}
                          className="text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          Mark read
                        </button>
                        <button
                          onClick={requestPushPermissions}
                          className="text-purple-400 hover:text-purple-300 font-semibold"
                        >
                          Enable Push
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 my-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link_url) {
                                onSelectTab('tournaments');
                                setShowNotifMenu(false);
                              }
                            }}
                            className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                              !n.is_read ? 'bg-rose-950/20 border-l-2 border-rose-500' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-white line-clamp-1">{n.title}</span>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-snug line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-colors"
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.ff_name}
                      className="w-7 h-7 rounded-lg object-cover border border-rose-500/40"
                    />
                    <div className="text-left hidden sm:block">
                      <span className="text-xs font-bold text-white block leading-none">{user.ff_name}</span>
                      <span className="text-[10px] text-slate-400 leading-none">
                        {user.role === 'admin' ? '🛡️ Admin' : `UID: ${user.ff_uid}`}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#121520] border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="p-3 border-b border-slate-800 mb-1">
                        <div className="text-xs font-bold text-white">{user.full_name}</div>
                        <div className="text-[11px] text-rose-400 font-mono">IGN: {user.ff_name}</div>
                        <div className="text-[10px] text-slate-400">UID: {user.ff_uid}</div>
                      </div>

                    <button
                      onClick={() => {
                        onSelectTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      Player Profile
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('matches');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-slate-400" />
                      My Tournaments
                    </button>

                    <button
                      onClick={() => {
                        onSelectTab('wallet');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <WalletIcon className="w-3.5 h-3.5 text-slate-400" />
                      Wallet & Transactions
                    </button>

                    <div className="my-1 border-t border-slate-800/80" />

                    {/* Quick Role Toggle (For Testing Admin Features) */}
                    <button
                      onClick={() => {
                        toggleAdminRole();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-purple-400 hover:bg-purple-950/40 flex items-center justify-between transition-colors"
                      title="Quickly switch between User and Admin roles"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Admin Mode
                      </span>
                      {isAdmin ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          ON
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">OFF</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-2 transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs tracking-wide shadow-md shadow-rose-950/50 transition-all hover:scale-105"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
