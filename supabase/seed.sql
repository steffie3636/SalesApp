-- SalesArena Seed Data
-- Run this after schema.sql in your Supabase SQL Editor

-- Seed Players
INSERT INTO players (id, name, initials, revenue, new_customers, calls, points, level) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Marco Bernasconi', 'MB', 125000, 8, 340, 4450, 5),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Sarah Keller', 'SK', 98000, 12, 280, 3760, 4),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Lukas Meier', 'LM', 87000, 5, 190, 2940, 3),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'Anna Widmer', 'AW', 64000, 3, 420, 2830, 3),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'David Schmid', 'DS', 42000, 2, 150, 1890, 2),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'Nina Fischer', 'NF', 31000, 1, 95, 1345, 2);

-- Seed Badges
INSERT INTO badges (id, name, description, color, emoji) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'On Fire', 'Heisse Serie – 5 Deals in einer Woche', '#f97316', '🔥'),
  ('b1b2c3d4-0002-4000-8000-000000000002', 'Diamond', 'Umsatz über CHF 100''000', '#0ea5e9', '💎'),
  ('b1b2c3d4-0003-4000-8000-000000000003', 'Sharpshooter', 'Höchste Abschlussquote im Monat', '#10b981', '🎯'),
  ('b1b2c3d4-0004-4000-8000-000000000004', 'Speed Demon', 'Schnellster Deal-Abschluss', '#8b5cf6', '⚡'),
  ('b1b2c3d4-0005-4000-8000-000000000005', 'Rising Star', 'Grösster Fortschritt im Monat', '#f59e0b', '⭐'),
  ('b1b2c3d4-0006-4000-8000-000000000006', 'Champion', 'Monatsbester im Leaderboard', '#ef4444', '🏆'),
  ('b1b2c3d4-0007-4000-8000-000000000007', 'Rocket', 'Umsatzziel um 50% übertroffen', '#6366f1', '🚀'),
  ('b1b2c3d4-0008-4000-8000-000000000008', 'New Blood', '10 Neukunden gewonnen', '#ec4899', '🩸');

-- Seed Player Badges
INSERT INTO player_badges (player_id, badge_id) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0002-4000-8000-000000000002'),
  ('a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0006-4000-8000-000000000006'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0003-4000-8000-000000000003'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0005-4000-8000-000000000005'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0008-4000-8000-000000000008'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'b1b2c3d4-0004-4000-8000-000000000004'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'b1b2c3d4-0007-4000-8000-000000000007'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'b1b2c3d4-0005-4000-8000-000000000005'),
  ('a1b2c3d4-0006-4000-8000-000000000006', 'b1b2c3d4-0005-4000-8000-000000000005');

-- Seed Challenges
INSERT INTO challenges (title, description, reward_points, target_value, current_progress, deadline, icon, color) VALUES
  ('Deal Crusher', '20 Deals in einem Monat abschliessen', 500, 20, 14, '2025-03-31', '💪', '#6366f1'),
  ('Cold Call King', '500 Anrufe in einem Quartal', 300, 500, 280, '2025-03-31', '📞', '#f97316'),
  ('New Blood', '15 Neukunden in einem Quartal gewinnen', 400, 15, 9, '2025-03-31', '🩸', '#ec4899'),
  ('Revenue Rocket', 'CHF 200''000 Umsatz in einem Quartal', 600, 200000, 135000, '2025-03-31', '🚀', '#10b981');

-- Seed Annual Goals 2025
INSERT INTO annual_goals (year, be_neukunden, anz_neukunden, be_total) VALUES
  (2025, 500000, 50, 2000000);
