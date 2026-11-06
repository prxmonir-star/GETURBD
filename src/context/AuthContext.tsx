import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { storage } from '../services/storage';

interface RegisterData {
  email: string;
  password?: string;
  full_name: string;
  ff_name: string;
  ff_uid: string;
  phone_number: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  allProfiles: Profile[];
  login: (email: string, password?: string) => { success: boolean; message: string };
  register: (data: RegisterData) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => { success: boolean; message: string };
  switchUser: (profileId: string) => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  toggleAdminRole: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const refreshUser = () => {
    const currentId = storage.getCurrentUserId();
    const profiles = storage.getProfiles();
    setAllProfiles(profiles);

    if (currentId) {
      const found = profiles.find(p => p.id === currentId);
      if (found && !found.is_blocked) {
        setUser(found);
      } else {
        setUser(null);
        storage.setCurrentUserId(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (email: string): { success: boolean; message: string } => {
    const found = storage.getProfileByEmail(email);
    if (!found) {
      return { success: false, message: 'No account found with this email address.' };
    }
    if (found.is_blocked) {
      return { success: false, message: 'This account has been suspended by administration.' };
    }

    storage.setCurrentUserId(found.id);
    setUser(found);
    return { success: true, message: `Welcome back, ${found.ff_name}!` };
  };

  const register = (data: RegisterData): { success: boolean; message: string } => {
    // Validate email format
    if (!data.email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    // Check email uniqueness
    if (storage.getProfileByEmail(data.email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    // Check Free Fire UID uniqueness
    const profiles = storage.getProfiles();
    if (profiles.some(p => p.ff_uid === data.ff_uid.trim())) {
      return { success: false, message: 'This Free Fire UID is already registered by another player.' };
    }

    const newProfile: Profile = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: `auth-${Date.now()}`,
      email: data.email.trim(),
      full_name: data.full_name.trim(),
      ff_name: data.ff_name.trim(),
      ff_uid: data.ff_uid.trim(),
      phone_number: data.phone_number.trim(),
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      is_blocked: false,
      email_verified: true,
      created_at: new Date().toISOString(),
      stats: { matches_played: 0, wins: 0, kills: 0, total_earnings: 0 }
    };

    storage.saveProfile(newProfile);
    storage.setCurrentUserId(newProfile.id);
    setUser(newProfile);
    setAllProfiles(storage.getProfiles());

    // Initialize wallet with zero verified balance (real funds require verified deposit)
    storage.getWalletByProfileId(newProfile.id);

    storage.addNotification({
      profile_id: newProfile.id,
      title: 'Welcome to FF TOURNAMENT PRO',
      message: 'Your account is ready. Add funds to your wallet via bKash/Nagad to join official tournament matches.',
      type: 'SYSTEM'
    });

    return { success: true, message: 'Account created successfully. Verified balance is ৳ 0.' };
  };

  const logout = () => {
    storage.setCurrentUserId(null);
    setUser(null);
  };

  const updateProfile = (updates: Partial<Profile>): { success: boolean; message: string } => {
    if (!user) return { success: false, message: 'Not logged in' };
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    storage.saveProfile(updated);
    setUser(updated);
    setAllProfiles(storage.getProfiles());
    return { success: true, message: 'Profile updated successfully.' };
  };

  const switchUser = (profileId: string) => {
    const target = storage.getProfileById(profileId);
    if (target) {
      storage.setCurrentUserId(target.id);
      setUser(target);
    }
  };

  const requestPasswordReset = (email: string): { success: boolean; message: string } => {
    const found = storage.getProfileByEmail(email);
    if (!found) {
      return { success: false, message: 'No account registered with this email address.' };
    }
    return { success: true, message: `Password reset link has been dispatched to ${email}.` };
  };

  const toggleAdminRole = () => {
    if (!user) return;
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    updateProfile({ role: newRole });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        allProfiles,
        login,
        register,
        logout,
        updateProfile,
        switchUser,
        requestPasswordReset,
        toggleAdminRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
