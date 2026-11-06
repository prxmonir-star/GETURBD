export type UserRole = 'user' | 'admin' | 'moderator';

export type TournamentStatus = 'UPCOMING' | 'OPEN' | 'CLOSED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export type MatchType = 'SOLO' | 'DUO' | 'SQUAD';

export type GameMap = 'Bermuda' | 'Purgatory' | 'Kalahari' | 'Alpine' | 'Nexterra';

export type GameMode = 'Battle Royale' | 'Clash Squad';

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'ENTRY_FEE' | 'PRIZE_MONEY' | 'REFUND' | 'ADMIN_ADJUSTMENT';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationType = 'TOURNAMENT' | 'MATCH_ROOM' | 'WALLET' | 'WINNER' | 'SYSTEM';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  ff_name: string; // Free Fire in-game name
  ff_uid: string; // Free Fire Player UID
  phone_number: string;
  avatar_url: string;
  role: UserRole;
  is_blocked: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
  stats?: {
    matches_played: number;
    wins: number;
    kills: number;
    total_earnings: number;
  };
}

export interface Wallet {
  id: string;
  profile_id: string;
  balance: number;
  locked_balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  title: string;
  match_type: MatchType;
  game_map: GameMap;
  game_mode: GameMode;
  banner_url: string;
  description: string;
  rules: string;
  entry_fee: number;
  prize_pool: number;
  first_prize: number;
  second_prize: number;
  third_prize: number;
  per_kill_prize: number;
  max_slots: number;
  registered_count: number;
  match_date_time: string;
  registration_deadline: string;
  status: TournamentStatus;
  room_id?: string;
  room_password?: string;
  room_published: boolean;
  created_by?: string;
  created_at: string;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  profile_id: string;
  team_id?: string;
  slot_number: number;
  ff_uid: string;
  ff_name: string;
  joined_at: string;
  payment_status: 'PAID' | 'REFUNDED';
}

export interface Team {
  id: string;
  tournament_id: string;
  team_name: string;
  leader_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  profile_id: string;
  ff_uid: string;
  ff_name: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  profile_id: string;
  type: TransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  reference_id?: string;
  status: TransactionStatus;
  created_at: string;
}

export interface DepositRequest {
  id: string;
  profile_id: string;
  user_name?: string;
  user_email?: string;
  method: PaymentMethod;
  amount: number;
  sender_number: string;
  transaction_id: string; // TrxID
  status: RequestStatus;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  profile_id: string;
  user_name?: string;
  user_email?: string;
  method: PaymentMethod;
  amount: number;
  account_type: 'Personal' | 'Agent';
  receiver_number: string;
  status: RequestStatus;
  payout_reference?: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface TournamentResult {
  id: string;
  tournament_id: string;
  profile_id: string;
  player_name: string;
  ff_uid: string;
  placement: number;
  kills: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
  prize_won: number;
  prize_paid: boolean;
  created_at: string;
}

export interface AppNotification {
  id: string;
  profile_id?: string | null; // null for broadcast
  title: string;
  message: string;
  type: NotificationType;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_id?: string;
  details?: Record<string, unknown> | string;
  created_at: string;
}

export interface AppSettings {
  bkash_number: string;
  bkash_enabled: boolean;
  nagad_number: string;
  nagad_enabled: boolean;
  rocket_number: string;
  rocket_enabled: boolean;
  min_deposit: number;
  min_withdrawal: number;
  point_per_kill: number;
  announcement_banner: string;
  supabase_connected: boolean;
}
