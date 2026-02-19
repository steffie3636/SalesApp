-- SalesArena Database Schema
-- Run this in your Supabase SQL Editor

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL CHECK (char_length(initials) BETWEEN 2 AND 3),
  avatar_url TEXT,
  revenue NUMERIC DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  be_neukunden NUMERIC DEFAULT 0,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  emoji TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Player-Badges junction table
CREATE TABLE IF NOT EXISTS player_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, badge_id)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  reward_points INTEGER DEFAULT 0,
  target_value NUMERIC DEFAULT 0,
  current_progress NUMERIC DEFAULT 0,
  deadline DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Annual goals table
CREATE TABLE IF NOT EXISTS annual_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  be_neukunden NUMERIC DEFAULT 0,
  anz_neukunden INTEGER DEFAULT 0,
  be_total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year)
);

-- Monthly actuals table
CREATE TABLE IF NOT EXISTS monthly_actuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  be_neukunden NUMERIC DEFAULT 0,
  anz_neukunden INTEGER DEFAULT 0,
  be_total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, year, month)
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  revenue NUMERIC DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  be_neukunden NUMERIC DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player' CHECK (role IN ('admin', 'player')),
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_points ON players(points DESC);
CREATE INDEX IF NOT EXISTS idx_player_badges_player ON player_badges(player_id);
CREATE INDEX IF NOT EXISTS idx_player_badges_badge ON player_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_monthly_actuals_player_year ON monthly_actuals(player_id, year);
CREATE INDEX IF NOT EXISTS idx_activity_log_player ON activity_log(player_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- Row Level Security Policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Profiles: users can read own, admins can read all
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (is_admin());

-- Players: everyone can read, admins can modify
CREATE POLICY "Everyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Admins can insert players" ON players FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update players" ON players FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete players" ON players FOR DELETE USING (is_admin());
-- Players can update their own avatar
CREATE POLICY "Players can update own avatar" ON players FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- Badges: everyone can read, admins can modify
CREATE POLICY "Everyone can read badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Admins can insert badges" ON badges FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update badges" ON badges FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete badges" ON badges FOR DELETE USING (is_admin());

-- Player Badges: everyone can read, admins can modify
CREATE POLICY "Everyone can read player_badges" ON player_badges FOR SELECT USING (true);
CREATE POLICY "Admins can insert player_badges" ON player_badges FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can delete player_badges" ON player_badges FOR DELETE USING (is_admin());

-- Challenges: everyone can read, admins can modify
CREATE POLICY "Everyone can read challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Admins can insert challenges" ON challenges FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update challenges" ON challenges FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete challenges" ON challenges FOR DELETE USING (is_admin());

-- Annual Goals: everyone can read, admins can modify
CREATE POLICY "Everyone can read annual_goals" ON annual_goals FOR SELECT USING (true);
CREATE POLICY "Admins can insert annual_goals" ON annual_goals FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update annual_goals" ON annual_goals FOR UPDATE USING (is_admin());

-- Monthly Actuals: everyone can read, admins can modify
CREATE POLICY "Everyone can read monthly_actuals" ON monthly_actuals FOR SELECT USING (true);
CREATE POLICY "Admins can insert monthly_actuals" ON monthly_actuals FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update monthly_actuals" ON monthly_actuals FOR UPDATE USING (is_admin());

-- Activity Log: everyone can read, admins can insert
CREATE POLICY "Everyone can read activity_log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Admins can insert activity_log" ON activity_log FOR INSERT WITH CHECK (is_admin());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER monthly_actuals_updated_at
  BEFORE UPDATE ON monthly_actuals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'player');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
