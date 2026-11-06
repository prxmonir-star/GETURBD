import {
  Profile,
  Wallet,
  Tournament,
  TournamentParticipant,
  Transaction,
  DepositRequest,
  WithdrawalRequest,
  TournamentResult,
  AppNotification,
  AdminLog,
  AppSettings,
  PaymentMethod
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const DB_VERSION_KEY = 'ff_pro_db_version';
const CURRENT_DB_VERSION = 'v3_nagad_payment_only';

const STORAGE_KEYS = {
  PROFILES: 'ff_pro_profiles_v3',
  WALLETS: 'ff_pro_wallets_v3',
  TOURNAMENTS: 'ff_pro_tournaments_v3',
  PARTICIPANTS: 'ff_pro_participants_v3',
  TRANSACTIONS: 'ff_pro_transactions_v3',
  DEPOSITS: 'ff_pro_deposits_v3',
  WITHDRAWALS: 'ff_pro_withdrawals_v3',
  RESULTS: 'ff_pro_results_v3',
  NOTIFICATIONS: 'ff_pro_notifications_v3',
  ADMIN_LOGS: 'ff_pro_admin_logs_v3',
  SETTINGS: 'ff_pro_settings_v3',
  CURRENT_USER_ID: 'ff_pro_current_user_id_v3',
};

// INITIAL SEED DATA: REAL SYSTEM DEFAULTS ONLY (ZERO FAKE MATCHES, ZERO FAKE STATS)
// Only 1 real default admin account so the platform administrator can authenticate and create matches.
const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'user-admin-master',
    user_id: 'auth-admin-master',
    email: 'admin@ffpro.com',
    full_name: 'Tournament Director',
    ff_name: 'FF_OFFICIAL',
    ff_uid: '1000000001',
    phone_number: '01711000001',
    avatar_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    is_blocked: false,
    email_verified: true,
    created_at: new Date().toISOString(),
    stats: { matches_played: 0, wins: 0, kills: 0, total_earnings: 0 }
  }
];

const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'wallet-admin-master',
    profile_id: 'user-admin-master',
    balance: 0.00,
    locked_balance: 0.00,
    currency: 'BDT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// ZERO FAKE TOURNAMENTS
const DEFAULT_TOURNAMENTS: Tournament[] = [];

// ZERO FAKE PARTICIPANTS
const DEFAULT_PARTICIPANTS: TournamentParticipant[] = [];

// ZERO FAKE TRANSACTIONS
const DEFAULT_TRANSACTIONS: Transaction[] = [];

// ZERO FAKE DEPOSITS
const DEFAULT_DEPOSITS: DepositRequest[] = [];

// ZERO FAKE WITHDRAWALS
const DEFAULT_WITHDRAWALS: WithdrawalRequest[] = [];

// ZERO FAKE RESULTS
const DEFAULT_RESULTS: TournamentResult[] = [];

// CLEAN INITIAL NOTIFICATIONS
const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-system-welcome',
    profile_id: null,
    title: 'FF TOURNAMENT PRO Arena Ready',
    message: 'Welcome to FF TOURNAMENT PRO. Tournaments will appear here as soon as an authorized admin creates matches.',
    type: 'SYSTEM',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_ADMIN_LOGS: AdminLog[] = [];

const DEFAULT_SETTINGS: AppSettings = {
  bkash_number: '',
  bkash_enabled: false,
  nagad_number: '01970246557',
  nagad_enabled: true,
  rocket_number: '',
  rocket_enabled: false,
  min_deposit: 50,
  min_withdrawal: 100,
  point_per_kill: 2,
  announcement_banner: 'Welcome to FF TOURNAMENT PRO. Tournaments will be posted here by authorized administrators.',
  supabase_connected: isSupabaseConfigured
};

// STORAGE SERVICE CLASS
class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Storage error for key ${key}:`, err);
    }
  }

  // Purge any outdated fake data and initialize real storage
  public init(): void {
    const savedVersion = localStorage.getItem(DB_VERSION_KEY);
    if (savedVersion !== CURRENT_DB_VERSION) {
      // Clean out all legacy storage keys containing fake tournaments/wallets
      const legacyKeys = [
        'ff_pro_profiles',
        'ff_pro_wallets',
        'ff_pro_tournaments',
        'ff_pro_participants',
        'ff_pro_transactions',
        'ff_pro_deposits',
        'ff_pro_withdrawals',
        'ff_pro_results',
        'ff_pro_notifications',
        'ff_pro_admin_logs',
        'ff_pro_settings',
        'ff_pro_current_user_id',
        'ff_pro_profiles_v2',
        'ff_pro_wallets_v2',
        'ff_pro_tournaments_v2',
        'ff_pro_participants_v2',
        'ff_pro_transactions_v2',
        'ff_pro_deposits_v2',
        'ff_pro_withdrawals_v2',
        'ff_pro_results_v2',
        'ff_pro_notifications_v2',
        'ff_pro_admin_logs_v2',
        'ff_pro_settings_v2',
        'ff_pro_current_user_id_v2'
      ];

      // Preserve existing real tournaments or profiles if created
      const existingTournaments = this.getItem<Tournament[]>('ff_pro_tournaments_v2', DEFAULT_TOURNAMENTS);
      const existingProfiles = this.getItem<Profile[]>('ff_pro_profiles_v2', DEFAULT_PROFILES);
      const existingWallets = this.getItem<Wallet[]>('ff_pro_wallets_v2', DEFAULT_WALLETS);

      legacyKeys.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);

      // Reset to pristine zero-fake-data state with new Nagad payment defaults
      this.setItem(STORAGE_KEYS.PROFILES, existingProfiles);
      this.setItem(STORAGE_KEYS.WALLETS, existingWallets);
      this.setItem(STORAGE_KEYS.TOURNAMENTS, existingTournaments);
      this.setItem(STORAGE_KEYS.PARTICIPANTS, DEFAULT_PARTICIPANTS);
      this.setItem(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
      this.setItem(STORAGE_KEYS.DEPOSITS, DEFAULT_DEPOSITS);
      this.setItem(STORAGE_KEYS.WITHDRAWALS, DEFAULT_WITHDRAWALS);
      this.setItem(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
      this.setItem(STORAGE_KEYS.ADMIN_LOGS, DEFAULT_ADMIN_LOGS);
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      this.setItem(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WALLETS)) {
      this.setItem(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
      this.setItem(STORAGE_KEYS.TOURNAMENTS, DEFAULT_TOURNAMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
      this.setItem(STORAGE_KEYS.PARTICIPANTS, DEFAULT_PARTICIPANTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      this.setItem(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPOSITS)) {
      this.setItem(STORAGE_KEYS.DEPOSITS, DEFAULT_DEPOSITS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) {
      this.setItem(STORAGE_KEYS.WITHDRAWALS, DEFAULT_WITHDRAWALS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
      this.setItem(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS)) {
      this.setItem(STORAGE_KEYS.ADMIN_LOGS, DEFAULT_ADMIN_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
  }

  // Current session - null by default for new visitors
  public getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || null;
  }

  public setCurrentUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }

  // PROFILES
  public getProfiles(): Profile[] {
    return this.getItem<Profile[]>(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
  }

  public getProfileById(id: string): Profile | undefined {
    return this.getProfiles().find(p => p.id === id);
  }

  public getProfileByEmail(email: string): Profile | undefined {
    return this.getProfiles().find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  public saveProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    this.setItem(STORAGE_KEYS.PROFILES, profiles);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        ff_name: profile.ff_name,
        ff_uid: profile.ff_uid,
        phone_number: profile.phone_number,
        avatar_url: profile.avatar_url,
        role: profile.role,
        is_blocked: profile.is_blocked,
        email_verified: profile.email_verified,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error('Supabase profile sync error:', error);
      });
    }
  }

  // WALLETS - Every new user starts with 0.00 verified balance
  public getWallets(): Wallet[] {
    return this.getItem<Wallet[]>(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
  }

  public getWalletByProfileId(profileId: string): Wallet {
    const wallets = this.getWallets();
    let wallet = wallets.find(w => w.profile_id === profileId);
    if (!wallet) {
      wallet = {
        id: `wallet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        profile_id: profileId,
        balance: 0.00,
        locked_balance: 0.00,
        currency: 'BDT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      wallets.push(wallet);
      this.setItem(STORAGE_KEYS.WALLETS, wallets);

      if (isSupabaseConfigured && supabase) {
        supabase.from('wallets').upsert({
          id: wallet.id,
          profile_id: wallet.profile_id,
          balance: wallet.balance,
          locked_balance: wallet.locked_balance,
          currency: wallet.currency
        }).then(({ error }) => {
          if (error) console.error('Supabase wallet sync error:', error);
        });
      }
    }
    return wallet;
  }

  public saveWallet(wallet: Wallet): void {
    const wallets = this.getWallets();
    const index = wallets.findIndex(w => w.id === wallet.id);
    if (index >= 0) {
      wallets[index] = { ...wallet, updated_at: new Date().toISOString() };
    } else {
      wallets.push(wallet);
    }
    this.setItem(STORAGE_KEYS.WALLETS, wallets);

    if (isSupabaseConfigured && supabase) {
      supabase.from('wallets').upsert({
        id: wallet.id,
        profile_id: wallet.profile_id,
        balance: wallet.balance,
        locked_balance: wallet.locked_balance,
        currency: wallet.currency,
        updated_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error('Supabase wallet sync error:', error);
      });
    }
  }

  // TRANSACTIONS
  public getTransactions(profileId?: string): Transaction[] {
    const txs = this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    if (profileId) {
      return txs.filter(t => t.profile_id === profileId);
    }
    return txs;
  }

  public addTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Transaction {
    const txs = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    txs.unshift(newTx);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, txs);

    if (isSupabaseConfigured && supabase) {
      supabase.from('transactions').insert({
        id: newTx.id,
        wallet_id: newTx.wallet_id,
        profile_id: newTx.profile_id,
        type: newTx.type,
        amount: newTx.amount,
        balance_before: newTx.balance_before,
        balance_after: newTx.balance_after,
        description: newTx.description,
        reference_id: newTx.reference_id,
        status: newTx.status
      }).then(({ error }) => {
        if (error) console.error('Supabase transaction sync error:', error);
      });
    }

    return newTx;
  }

  // ATOMIC WALLET OPERATIONS
  public atomicDeduct(profileId: string, amount: number, description: string, referenceId?: string): boolean {
    const wallet = this.getWalletByProfileId(profileId);
    if (wallet.balance < amount) {
      return false; // Insufficient funds
    }
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;
    wallet.balance = balanceAfter;
    this.saveWallet(wallet);

    this.addTransaction({
      wallet_id: wallet.id,
      profile_id: profileId,
      type: 'ENTRY_FEE',
      amount: -amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
      reference_id: referenceId,
      status: 'COMPLETED'
    });
    return true;
  }

  public atomicCredit(profileId: string, amount: number, type: 'DEPOSIT' | 'PRIZE_MONEY' | 'REFUND' | 'ADMIN_ADJUSTMENT', description: string, referenceId?: string): Wallet {
    const wallet = this.getWalletByProfileId(profileId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;
    wallet.balance = balanceAfter;
    this.saveWallet(wallet);

    this.addTransaction({
      wallet_id: wallet.id,
      profile_id: profileId,
      type,
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
      reference_id: referenceId,
      status: 'COMPLETED'
    });
    return wallet;
  }

  // TOURNAMENTS
  public getTournaments(): Tournament[] {
    return this.getItem<Tournament[]>(STORAGE_KEYS.TOURNAMENTS, DEFAULT_TOURNAMENTS);
  }

  public getTournamentById(id: string): Tournament | undefined {
    return this.getTournaments().find(t => t.id === id);
  }

  public saveTournament(tournament: Tournament): void {
    const tournaments = this.getTournaments();
    const index = tournaments.findIndex(t => t.id === tournament.id);
    if (index >= 0) {
      tournaments[index] = tournament;
    } else {
      tournaments.unshift(tournament);
    }
    this.setItem(STORAGE_KEYS.TOURNAMENTS, tournaments);

    if (isSupabaseConfigured && supabase) {
      supabase.from('tournaments').upsert({
        id: tournament.id,
        title: tournament.title,
        match_type: tournament.match_type,
        game_map: tournament.game_map,
        game_mode: tournament.game_mode,
        banner_url: tournament.banner_url,
        description: tournament.description,
        rules: tournament.rules,
        entry_fee: tournament.entry_fee,
        prize_pool: tournament.prize_pool,
        first_prize: tournament.first_prize,
        second_prize: tournament.second_prize,
        third_prize: tournament.third_prize,
        per_kill_prize: tournament.per_kill_prize,
        max_slots: tournament.max_slots,
        registered_count: tournament.registered_count,
        match_date_time: tournament.match_date_time,
        registration_deadline: tournament.registration_deadline,
        status: tournament.status,
        room_id: tournament.room_id,
        room_password: tournament.room_password,
        room_published: tournament.room_published,
        created_by: tournament.created_by
      }).then(({ error }) => {
        if (error) console.error('Supabase tournament sync error:', error);
      });
    }
  }

  public deleteTournament(id: string): void {
    const tournaments = this.getTournaments().filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TOURNAMENTS, tournaments);

    if (isSupabaseConfigured && supabase) {
      supabase.from('tournaments').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase tournament delete error:', error);
      });
    }
  }

  // PARTICIPANTS
  public getParticipants(tournamentId?: string): TournamentParticipant[] {
    const list = this.getItem<TournamentParticipant[]>(STORAGE_KEYS.PARTICIPANTS, DEFAULT_PARTICIPANTS);
    if (tournamentId) {
      return list.filter(p => p.tournament_id === tournamentId);
    }
    return list;
  }

  public isUserRegistered(tournamentId: string, profileId: string): boolean {
    return this.getParticipants(tournamentId).some(p => p.profile_id === profileId && p.payment_status === 'PAID');
  }

  public joinTournament(profileId: string, tournamentId: string): { success: boolean; message: string } {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return { success: false, message: 'Tournament not found' };

    if (tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') {
      return { success: false, message: 'Tournament is no longer active' };
    }

    if (new Date(tournament.registration_deadline) < new Date()) {
      return { success: false, message: 'Registration has already closed for this tournament' };
    }

    if (tournament.registered_count >= tournament.max_slots) {
      return { success: false, message: 'Tournament slots are completely full!' };
    }

    if (this.isUserRegistered(tournamentId, profileId)) {
      return { success: false, message: 'You are already registered for this tournament!' };
    }

    const profile = this.getProfileById(profileId);
    if (!profile) return { success: false, message: 'Profile not found' };

    if (!profile.ff_uid || !profile.ff_name) {
      return { success: false, message: 'Please update your Free Fire UID and in-game name in your profile before registering.' };
    }

    // Atomic entry fee check & deduction
    if (tournament.entry_fee > 0) {
      const wallet = this.getWalletByProfileId(profileId);
      if (wallet.balance < tournament.entry_fee) {
        return {
          success: false,
          message: `Insufficient wallet balance! Entry fee is ৳ ${tournament.entry_fee}, but your available balance is ৳ ${wallet.balance}. Please add money to your wallet.`
        };
      }
      this.atomicDeduct(profileId, tournament.entry_fee, `Entry fee for ${tournament.title}`, tournament.id);
    }

    // Add participant
    const participants = this.getParticipants();
    const newParticipant: TournamentParticipant = {
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tournament_id: tournamentId,
      profile_id: profileId,
      slot_number: tournament.registered_count + 1,
      ff_uid: profile.ff_uid,
      ff_name: profile.ff_name,
      joined_at: new Date().toISOString(),
      payment_status: 'PAID'
    };
    participants.push(newParticipant);
    this.setItem(STORAGE_KEYS.PARTICIPANTS, participants);

    // Increment registered count
    tournament.registered_count += 1;
    this.saveTournament(tournament);

    // Sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('tournament_participants').insert({
        id: newParticipant.id,
        tournament_id: newParticipant.tournament_id,
        profile_id: newParticipant.profile_id,
        slot_number: newParticipant.slot_number,
        ff_uid: newParticipant.ff_uid,
        ff_name: newParticipant.ff_name,
        payment_status: newParticipant.payment_status
      }).then(({ error }) => {
        if (error) console.error('Supabase participant sync error:', error);
      });
    }

    // Notify user
    this.addNotification({
      profile_id: profileId,
      title: '✅ Registration Confirmed!',
      message: `You successfully registered for ${tournament.title}. Slot #${newParticipant.slot_number} reserved. Room ID & password will be visible here before match time.`,
      type: 'TOURNAMENT',
      link_url: '/tournaments'
    });

    return { success: true, message: 'Registration successful! Slot reserved.' };
  }

  public leaveTournament(profileId: string, tournamentId: string): { success: boolean; message: string } {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return { success: false, message: 'Tournament not found' };

    if (tournament.status === 'LIVE' || tournament.status === 'COMPLETED') {
      return { success: false, message: 'Cannot leave tournament while match is live or finished.' };
    }

    if (new Date(tournament.registration_deadline) < new Date()) {
      return { success: false, message: 'Registration has already closed. Cancellation is no longer permitted.' };
    }

    const participants = this.getParticipants();
    const index = participants.findIndex(p => p.tournament_id === tournamentId && p.profile_id === profileId && p.payment_status === 'PAID');
    if (index === -1) {
      return { success: false, message: 'You are not registered in this tournament.' };
    }

    participants.splice(index, 1);
    this.setItem(STORAGE_KEYS.PARTICIPANTS, participants);

    // Decrement count
    tournament.registered_count = Math.max(0, tournament.registered_count - 1);
    this.saveTournament(tournament);

    // Atomic refund
    if (tournament.entry_fee > 0) {
      this.atomicCredit(profileId, tournament.entry_fee, 'REFUND', `Refund for cancelled registration: ${tournament.title}`, tournament.id);
    }

    this.addNotification({
      profile_id: profileId,
      title: '🔄 Tournament Cancelled & Refunded',
      message: `You have left ${tournament.title}. ৳ ${tournament.entry_fee} has been refunded to your wallet.`,
      type: 'WALLET'
    });

    return { success: true, message: 'You have left the tournament and your entry fee has been refunded.' };
  }

  // DEPOSIT REQUESTS - Never increases balance upon submission
  public getDeposits(): DepositRequest[] {
    return this.getItem<DepositRequest[]>(STORAGE_KEYS.DEPOSITS, DEFAULT_DEPOSITS);
  }

  public submitDeposit(profileId: string, method: PaymentMethod, amount: number, senderNumber: string, transactionId: string): { success: boolean; message: string } {
    const settings = this.getSettings();
    if (method === 'bKash' && !settings.bkash_enabled) {
      return { success: false, message: 'bKash deposits are currently disabled. Please use Nagad.' };
    }
    if (method === 'Rocket' && !settings.rocket_enabled) {
      return { success: false, message: 'Rocket deposits are currently disabled. Please use Nagad.' };
    }
    if (method === 'Nagad' && !settings.nagad_enabled) {
      return { success: false, message: 'Nagad deposits are currently disabled.' };
    }
    if (amount < settings.min_deposit) {
      return { success: false, message: `Minimum deposit amount is ৳ ${settings.min_deposit}.` };
    }

    const trimmedTrx = transactionId.trim().toUpperCase();
    if (!trimmedTrx) {
      return { success: false, message: 'Please provide a valid Transaction ID (TrxID).' };
    }

    const deposits = this.getDeposits();
    // Prevent duplicate TrxID
    const duplicate = deposits.find(d => d.transaction_id.toUpperCase() === trimmedTrx);
    if (duplicate) {
      return { success: false, message: 'This Transaction ID (TrxID) has already been submitted!' };
    }

    const profile = this.getProfileById(profileId);
    const newDeposit: DepositRequest = {
      id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profile_id: profileId,
      user_name: profile ? `${profile.full_name} (${profile.ff_name})` : 'User',
      user_email: profile?.email,
      method,
      amount,
      sender_number: senderNumber.trim(),
      transaction_id: trimmedTrx,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    deposits.unshift(newDeposit);
    this.setItem(STORAGE_KEYS.DEPOSITS, deposits);

    if (isSupabaseConfigured && supabase) {
      supabase.from('deposit_requests').insert({
        id: newDeposit.id,
        profile_id: newDeposit.profile_id,
        method: newDeposit.method,
        amount: newDeposit.amount,
        sender_number: newDeposit.sender_number,
        transaction_id: newDeposit.transaction_id,
        status: newDeposit.status
      }).then(({ error }) => {
        if (error) console.error('Supabase deposit sync error:', error);
      });
    }

    this.addNotification({
      profile_id: profileId,
      title: '⏳ Deposit Request Submitted',
      message: `Your deposit request for ৳ ${amount} via ${method} (TrxID: ${trimmedTrx}) is under review by admin.`,
      type: 'WALLET'
    });

    return { success: true, message: 'Deposit request submitted successfully! An admin will verify the TrxID shortly.' };
  }

  public approveDeposit(depositId: string, adminId: string, adminNotes?: string): { success: boolean; message: string } {
    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) return { success: false, message: 'Deposit not found' };
    if (deposit.status !== 'PENDING') return { success: false, message: `Deposit is already ${deposit.status}` };

    deposit.status = 'APPROVED';
    deposit.reviewed_by = adminId;
    deposit.reviewed_at = new Date().toISOString();
    deposit.admin_notes = adminNotes || 'Approved by admin';
    this.setItem(STORAGE_KEYS.DEPOSITS, deposits);

    // Atomically credit user balance ONLY after verified admin approval
    this.atomicCredit(deposit.profile_id, deposit.amount, 'DEPOSIT', `${deposit.method} Deposit Approved (TrxID: ${deposit.transaction_id})`, deposit.id);

    // Notify user
    this.addNotification({
      profile_id: deposit.profile_id,
      title: '💰 Deposit Approved!',
      message: `৳ ${deposit.amount} has been added to your wallet from ${deposit.method} deposit (TrxID: ${deposit.transaction_id}).`,
      type: 'WALLET'
    });

    // Log admin action
    this.addAdminLog({
      admin_id: adminId,
      admin_name: this.getProfileById(adminId)?.full_name || 'Admin',
      action: 'APPROVED_DEPOSIT',
      target_id: deposit.id,
      details: { amount: deposit.amount, method: deposit.method, trxId: deposit.transaction_id, user: deposit.user_name }
    });

    return { success: true, message: 'Deposit approved and balance credited successfully.' };
  }

  public rejectDeposit(depositId: string, adminId: string, reason: string): { success: boolean; message: string } {
    const deposits = this.getDeposits();
    const deposit = deposits.find(d => d.id === depositId);
    if (!deposit) return { success: false, message: 'Deposit not found' };
    if (deposit.status !== 'PENDING') return { success: false, message: `Deposit is already ${deposit.status}` };

    deposit.status = 'REJECTED';
    deposit.reviewed_by = adminId;
    deposit.reviewed_at = new Date().toISOString();
    deposit.admin_notes = reason || 'Invalid transaction ID or payment not received';
    this.setItem(STORAGE_KEYS.DEPOSITS, deposits);

    this.addNotification({
      profile_id: deposit.profile_id,
      title: '❌ Deposit Request Rejected',
      message: `Your deposit request for ৳ ${deposit.amount} was rejected. Reason: ${deposit.admin_notes}`,
      type: 'WALLET'
    });

    this.addAdminLog({
      admin_id: adminId,
      admin_name: this.getProfileById(adminId)?.full_name || 'Admin',
      action: 'REJECTED_DEPOSIT',
      target_id: deposit.id,
      details: { amount: deposit.amount, reason }
    });

    return { success: true, message: 'Deposit rejected.' };
  }

  // WITHDRAWAL REQUESTS
  public getWithdrawals(): WithdrawalRequest[] {
    return this.getItem<WithdrawalRequest[]>(STORAGE_KEYS.WITHDRAWALS, DEFAULT_WITHDRAWALS);
  }

  public submitWithdrawal(profileId: string, method: PaymentMethod, amount: number, receiverNumber: string, accountType: 'Personal' | 'Agent'): { success: boolean; message: string } {
    const settings = this.getSettings();
    if (method === 'bKash' && !settings.bkash_enabled) {
      return { success: false, message: 'bKash withdrawals are currently disabled. Please use Nagad.' };
    }
    if (method === 'Rocket' && !settings.rocket_enabled) {
      return { success: false, message: 'Rocket withdrawals are currently disabled. Please use Nagad.' };
    }
    if (method === 'Nagad' && !settings.nagad_enabled) {
      return { success: false, message: 'Nagad withdrawals are currently disabled.' };
    }
    if (amount < settings.min_withdrawal) {
      return { success: false, message: `Minimum withdrawal amount is ৳ ${settings.min_withdrawal}.` };
    }

    const wallet = this.getWalletByProfileId(profileId);
    if (wallet.balance < amount) {
      return { success: false, message: `Insufficient balance! Your available balance is ৳ ${wallet.balance}.` };
    }

    // Atomically lock requested amount immediately so it cannot be double spent
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;
    wallet.balance = balanceAfter;
    this.saveWallet(wallet);

    const withdrawals = this.getWithdrawals();
    const profile = this.getProfileById(profileId);
    const newWithdrawal: WithdrawalRequest = {
      id: `wth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      profile_id: profileId,
      user_name: profile ? `${profile.full_name} (${profile.ff_name})` : 'User',
      user_email: profile?.email,
      method,
      amount,
      account_type: accountType,
      receiver_number: receiverNumber.trim(),
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    withdrawals.unshift(newWithdrawal);
    this.setItem(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    this.addTransaction({
      wallet_id: wallet.id,
      profile_id: profileId,
      type: 'WITHDRAWAL',
      amount: -amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description: `Pending ${method} Withdrawal to ${receiverNumber} (${accountType})`,
      reference_id: newWithdrawal.id,
      status: 'PENDING'
    });

    this.addNotification({
      profile_id: profileId,
      title: '📤 Withdrawal Request Received',
      message: `Your withdrawal request for ৳ ${amount} to ${receiverNumber} via ${method} is being processed.`,
      type: 'WALLET'
    });

    return { success: true, message: 'Withdrawal request submitted! Payout will be sent within 1-2 hours.' };
  }

  public approveWithdrawal(withdrawalId: string, adminId: string, payoutReference: string, adminNotes?: string): { success: boolean; message: string } {
    const withdrawals = this.getWithdrawals();
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return { success: false, message: 'Withdrawal not found' };
    if (withdrawal.status !== 'PENDING') return { success: false, message: `Withdrawal is already ${withdrawal.status}` };

    withdrawal.status = 'APPROVED';
    withdrawal.payout_reference = payoutReference;
    withdrawal.reviewed_by = adminId;
    withdrawal.reviewed_at = new Date().toISOString();
    withdrawal.admin_notes = adminNotes || 'Payout processed';
    this.setItem(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    // Update transaction status to COMPLETED
    const txs = this.getTransactions();
    const tx = txs.find(t => t.reference_id === withdrawal.id);
    if (tx) {
      tx.status = 'COMPLETED';
      tx.description = `${withdrawal.method} Withdrawal Sent (Ref: ${payoutReference})`;
      this.setItem(STORAGE_KEYS.TRANSACTIONS, txs);
    }

    this.addNotification({
      profile_id: withdrawal.profile_id,
      title: '✅ Withdrawal Completed!',
      message: `৳ ${withdrawal.amount} has been successfully sent to ${withdrawal.receiver_number} via ${withdrawal.method}. Reference: ${payoutReference}`,
      type: 'WALLET'
    });

    this.addAdminLog({
      admin_id: adminId,
      admin_name: this.getProfileById(adminId)?.full_name || 'Admin',
      action: 'APPROVED_WITHDRAWAL',
      target_id: withdrawal.id,
      details: { amount: withdrawal.amount, method: withdrawal.method, payoutRef: payoutReference, receiver: withdrawal.receiver_number }
    });

    return { success: true, message: 'Withdrawal approved and marked completed.' };
  }

  public rejectWithdrawal(withdrawalId: string, adminId: string, reason: string): { success: boolean; message: string } {
    const withdrawals = this.getWithdrawals();
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    if (!withdrawal) return { success: false, message: 'Withdrawal not found' };
    if (withdrawal.status !== 'PENDING') return { success: false, message: `Withdrawal is already ${withdrawal.status}` };

    withdrawal.status = 'REJECTED';
    withdrawal.reviewed_by = adminId;
    withdrawal.reviewed_at = new Date().toISOString();
    withdrawal.admin_notes = reason || 'Rejected by admin';
    this.setItem(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    // Refund locked balance back to user
    this.atomicCredit(withdrawal.profile_id, withdrawal.amount, 'REFUND', `Refund for rejected withdrawal request: ${reason}`, withdrawal.id);

    // Update pending transaction to REVERSED
    const txs = this.getTransactions();
    const tx = txs.find(t => t.reference_id === withdrawal.id && t.status === 'PENDING');
    if (tx) {
      tx.status = 'REVERSED';
      this.setItem(STORAGE_KEYS.TRANSACTIONS, txs);
    }

    this.addNotification({
      profile_id: withdrawal.profile_id,
      title: '⚠️ Withdrawal Rejected (Refunded)',
      message: `Your withdrawal for ৳ ${withdrawal.amount} was rejected. ৳ ${withdrawal.amount} was refunded to your wallet. Reason: ${reason}`,
      type: 'WALLET'
    });

    this.addAdminLog({
      admin_id: adminId,
      admin_name: this.getProfileById(adminId)?.full_name || 'Admin',
      action: 'REJECTED_WITHDRAWAL',
      target_id: withdrawal.id,
      details: { amount: withdrawal.amount, reason }
    });

    return { success: true, message: 'Withdrawal rejected and funds refunded to user wallet.' };
  }

  // RESULTS & WINNER MANAGEMENT
  public getResults(tournamentId?: string): TournamentResult[] {
    const results = this.getItem<TournamentResult[]>(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
    if (tournamentId) {
      return results.filter(r => r.tournament_id === tournamentId);
    }
    return results;
  }

  public submitTournamentResults(tournamentId: string, results: Array<{ profile_id: string; placement: number; kills: number }>, adminId: string): { success: boolean; message: string } {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return { success: false, message: 'Tournament not found' };

    const existingResults = this.getResults().filter(r => r.tournament_id !== tournamentId);
    const settings = this.getSettings();
    const killPointRate = settings.point_per_kill || 2;

    const placementPointsTable: Record<number, number> = {
      1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1
    };

    const newResultRecords: TournamentResult[] = [];

    for (const res of results) {
      const profile = this.getProfileById(res.profile_id);
      if (!profile) continue;

      const pPoints = placementPointsTable[res.placement] || 0;
      const kPoints = res.kills * killPointRate;
      const totalPoints = pPoints + kPoints;

      let prize = 0;
      if (res.placement === 1) prize += tournament.first_prize;
      else if (res.placement === 2) prize += tournament.second_prize;
      else if (res.placement === 3) prize += tournament.third_prize;

      prize += res.kills * (tournament.per_kill_prize || 0);

      const record: TournamentResult = {
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tournament_id: tournamentId,
        profile_id: res.profile_id,
        player_name: profile.ff_name,
        ff_uid: profile.ff_uid,
        placement: res.placement,
        kills: res.kills,
        placement_points: pPoints,
        kill_points: kPoints,
        total_points: totalPoints,
        prize_won: prize,
        prize_paid: true,
        created_at: new Date().toISOString()
      };

      newResultRecords.push(record);

      if (prize > 0) {
        this.atomicCredit(
          res.profile_id,
          prize,
          'PRIZE_MONEY',
          `Tournament Prize (${res.placement} Place + ${res.kills} Kills) for ${tournament.title}`,
          tournament.id
        );

        this.addNotification({
          profile_id: res.profile_id,
          title: '🎉 TOURNAMENT PRIZE WON!',
          message: `Congratulations! You placed #${res.placement} with ${res.kills} kills in ${tournament.title}. ৳ ${prize} has been credited to your wallet!`,
          type: 'WINNER'
        });
      }

      if (!profile.stats) {
        profile.stats = { matches_played: 0, wins: 0, kills: 0, total_earnings: 0 };
      }
      profile.stats.matches_played += 1;
      if (res.placement === 1) profile.stats.wins += 1;
      profile.stats.kills += res.kills;
      profile.stats.total_earnings += prize;
      this.saveProfile(profile);
    }

    this.setItem(STORAGE_KEYS.RESULTS, [...newResultRecords, ...existingResults]);

    tournament.status = 'COMPLETED';
    this.saveTournament(tournament);

    const champion = newResultRecords.find(r => r.placement === 1);
    this.addNotification({
      profile_id: null,
      title: `🏆 ${tournament.title} Concluded!`,
      message: champion 
        ? `Match completed! Champion: ${champion.player_name} (${champion.kills} kills). Total prizes distributed: ৳ ${tournament.prize_pool}.`
        : `Results declared for ${tournament.title}. Check leaderboard!`,
      type: 'WINNER',
      link_url: '/tournaments'
    });

    this.addAdminLog({
      admin_id: adminId,
      admin_name: this.getProfileById(adminId)?.full_name || 'Admin',
      action: 'DECLARED_WINNERS',
      target_id: tournament.id,
      details: { tournament: tournament.title, participantCount: results.length, champion: champion?.player_name }
    });

    return { success: true, message: 'Tournament results declared and prize money credited automatically to winners!' };
  }

  // NOTIFICATIONS
  public getNotifications(profileId?: string): AppNotification[] {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    if (!profileId) return all;
    return all.filter(n => n.profile_id === null || n.profile_id === profileId);
  }

  public addNotification(notification: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>): AppNotification {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    list.unshift(newNotif);
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const list = this.getNotifications();
    const notif = list.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsAsRead(profileId: string): void {
    const list = this.getNotifications();
    list.forEach(n => {
      if (n.profile_id === null || n.profile_id === profileId) {
        n.is_read = true;
      }
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // ADMIN LOGS
  public getAdminLogs(): AdminLog[] {
    return this.getItem<AdminLog[]>(STORAGE_KEYS.ADMIN_LOGS, DEFAULT_ADMIN_LOGS);
  }

  public addAdminLog(log: Omit<AdminLog, 'id' | 'created_at'>): void {
    const logs = this.getAdminLogs();
    const newLog: AdminLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.setItem(STORAGE_KEYS.ADMIN_LOGS, logs);
  }

  // SETTINGS
  public getSettings(): AppSettings {
    const loaded = this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...loaded,
      nagad_number: loaded.nagad_number || '01970246557',
      nagad_enabled: loaded.nagad_enabled ?? true,
      bkash_enabled: loaded.bkash_enabled ?? false,
      rocket_enabled: loaded.rocket_enabled ?? false,
      bkash_number: loaded.bkash_number ?? '',
      rocket_number: loaded.rocket_number ?? ''
    };
  }

  public saveSettings(settings: AppSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);

    // Save permanently to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const entries = [
        { setting_key: 'bkash_number', setting_value: settings.bkash_number || '', description: 'Official bKash Personal Number' },
        { setting_key: 'bkash_enabled', setting_value: String(settings.bkash_enabled), description: 'bKash gateway enabled status' },
        { setting_key: 'nagad_number', setting_value: settings.nagad_number || '01970246557', description: 'Official Nagad Personal Number' },
        { setting_key: 'nagad_enabled', setting_value: String(settings.nagad_enabled), description: 'Nagad gateway enabled status' },
        { setting_key: 'rocket_number', setting_value: settings.rocket_number || '', description: 'Official Rocket Personal Number' },
        { setting_key: 'rocket_enabled', setting_value: String(settings.rocket_enabled), description: 'Rocket gateway enabled status' },
        { setting_key: 'min_deposit', setting_value: String(settings.min_deposit), description: 'Minimum allowed deposit in BDT' },
        { setting_key: 'min_withdrawal', setting_value: String(settings.min_withdrawal), description: 'Minimum allowed withdrawal in BDT' },
        { setting_key: 'point_per_kill', setting_value: String(settings.point_per_kill), description: 'Tournament points per kill' },
        { setting_key: 'announcement_banner', setting_value: settings.announcement_banner, description: 'Global banner text' }
      ];
      supabase.from('app_settings').upsert(entries, { onConflict: 'setting_key' })
        .then(({ error }) => {
          if (error) console.error('Supabase settings permanent save error:', error);
        });
    }
  }
}

export const storage = new StorageService();
storage.init();
