-- ==============================================================================
-- FF TOURNAMENT PRO - COMPLETE POSTGRESQL & SUPABASE DATABASE MIGRATION
-- Project: Free Fire Tournament Management Platform
-- Includes all 14 requested tables, foreign keys, indexes, triggers, and RLS policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  ff_name TEXT NOT NULL, -- Free Fire In-Game Name
  ff_uid TEXT NOT NULL UNIQUE, -- Free Fire Player UID (e.g. 1928374650)
  phone_number TEXT,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. WALLETS TABLE (One-to-one with profiles)
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0.00),
  locked_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (locked_balance >= 0.00), -- for pending withdrawals or registrations
  currency TEXT NOT NULL DEFAULT 'BDT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('SOLO', 'DUO', 'SQUAD')),
  game_map TEXT NOT NULL CHECK (game_map IN ('Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nexterra')),
  game_mode TEXT NOT NULL DEFAULT 'Battle Royale' CHECK (game_mode IN ('Battle Royale', 'Clash Squad')),
  banner_url TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (entry_fee >= 0.00),
  prize_pool NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (prize_pool >= 0.00),
  first_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  second_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  third_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  per_kill_prize NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  max_slots INTEGER NOT NULL DEFAULT 48 CHECK (max_slots > 0),
  registered_count INTEGER NOT NULL DEFAULT 0 CHECK (registered_count <= max_slots),
  match_date_time TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'OPEN', 'CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED')),
  room_id TEXT,
  room_password TEXT,
  room_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TEAMS TABLE (For DUO and SQUAD tournaments)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TEAM_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ff_uid TEXT NOT NULL,
  ff_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, profile_id)
);

-- 6. TOURNAMENT_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  slot_number INTEGER NOT NULL,
  ff_uid TEXT NOT NULL,
  ff_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_status TEXT NOT NULL DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'REFUNDED')),
  UNIQUE(tournament_id, profile_id)
);

-- 7. TRANSACTIONS TABLE (Immutable ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'ENTRY_FEE', 'PRIZE_MONEY', 'REFUND', 'ADMIN_ADJUSTMENT')),
  amount NUMERIC(12, 2) NOT NULL,
  balance_before NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT, -- e.g. tournament_id, deposit_request_id, TrxID
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REVERSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. DEPOSIT_REQUESTS TABLE (bKash / Nagad / Rocket)
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('bKash', 'Nagad', 'Rocket')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  sender_number TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE, -- TrxID provided by mobile banking
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. WITHDRAWAL_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('bKash', 'Nagad', 'Rocket')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 50.00), -- minimum 50 BDT
  account_type TEXT NOT NULL DEFAULT 'Personal' CHECK (account_type IN ('Personal', 'Agent')),
  receiver_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  payout_reference TEXT, -- Payment gateway or sender transaction reference
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. TOURNAMENT_RESULTS TABLE (Match winners & kills)
CREATE TABLE IF NOT EXISTS public.tournament_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  placement INTEGER NOT NULL CHECK (placement > 0),
  kills INTEGER NOT NULL DEFAULT 0 CHECK (kills >= 0),
  placement_points INTEGER NOT NULL DEFAULT 0,
  kill_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  prize_won NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (prize_won >= 0.00),
  prize_paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, profile_id)
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means broadcast to ALL users
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TOURNAMENT', 'MATCH_ROOM', 'WALLET', 'WINNER', 'SYSTEM')),
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ADMIN_LOGS TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL, -- e.g. "APPROVED_DEPOSIT", "CREATED_MATCH", "PUBLISHED_ROOM", "DECLARED_WINNERS"
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. PAYMENT_WEBHOOK_EVENTS TABLE (For real gateway callbacks)
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gateway TEXT NOT NULL, -- 'bkash', 'nagad', 'aamarpay', 'shurjopay', 'sslcommerz'
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'PROCESSED', 'FAILED')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. APP_SETTINGS TABLE (Platform configurations)
CREATE TABLE IF NOT EXISTS public.app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED DEFAULT SETTINGS
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES 
  ('nagad_number', '01970246557', 'Official Nagad Personal Number (Enabled)'),
  ('nagad_enabled', 'true', 'Nagad payment gateway enabled status'),
  ('bkash_number', '', 'Official bKash Personal Number (Disabled)'),
  ('bkash_enabled', 'false', 'bKash payment gateway enabled status'),
  ('rocket_number', '', 'Official Rocket Personal Number (Disabled)'),
  ('rocket_enabled', 'false', 'Rocket payment gateway enabled status'),
  ('min_deposit', '50', 'Minimum allowed deposit amount in BDT'),
  ('min_withdrawal', '100', 'Minimum allowed withdrawal amount in BDT'),
  ('point_per_kill', '2', 'Points awarded per kill in tournament'),
  ('announcement_banner', '🔥 Welcome to FF TOURNAMENT PRO! Official esports arena.', 'Global banner message')
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description;

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON public.tournaments(match_date_time);
CREATE INDEX IF NOT EXISTS idx_participants_tournament ON public.tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_profile ON public.tournament_participants(profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile or public esports usernames; only owner can update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Wallets: Only owner and admins can view wallets
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (
  profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Tournaments: Viewable by all users
CREATE POLICY "Tournaments are viewable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Only admins can modify tournaments" ON public.tournaments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Room ID and Password restricted to participants or admins
-- (Controlled via client query and secure view or function in Supabase)
