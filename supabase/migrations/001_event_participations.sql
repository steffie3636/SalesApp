-- Migration: Event Participations für Event-Challenges
-- Ausführen im Supabase SQL Editor

-- 1. Spalte challenge_type zu challenges hinzufügen
ALTER TABLE challenges
  ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'standard'
  CHECK (challenge_type IN ('standard', 'event'));

-- 2. event_participations Tabelle erstellen
CREATE TABLE IF NOT EXISTS event_participations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indizes
CREATE INDEX IF NOT EXISTS idx_event_participations_challenge ON event_participations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_event_participations_player ON event_participations(player_id);

-- 4. Row Level Security
ALTER TABLE event_participations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read event_participations"
  ON event_participations FOR SELECT USING (true);

CREATE POLICY "Players can insert own event_participations"
  ON event_participations FOR INSERT WITH CHECK (
    player_id = (SELECT player_id FROM profiles WHERE id = auth.uid() LIMIT 1)
    OR is_admin()
  );

CREATE POLICY "Players can delete own event_participations"
  ON event_participations FOR DELETE USING (
    player_id = (SELECT player_id FROM profiles WHERE id = auth.uid() LIMIT 1)
    OR is_admin()
  );

-- 5. Trigger-Funktion: Punkte automatisch vergeben / entziehen
CREATE OR REPLACE FUNCTION sync_event_challenge_points()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge challenges%ROWTYPE;
  v_count_before INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT * INTO v_challenge FROM challenges WHERE id = NEW.challenge_id;
    SELECT COUNT(*) - 1 INTO v_count_before
    FROM event_participations
    WHERE challenge_id = NEW.challenge_id AND player_id = NEW.player_id;

    IF v_count_before < v_challenge.target_value THEN
      UPDATE players
      SET
        points = points + v_challenge.reward_points,
        level = GREATEST(1, (FLOOR((points + v_challenge.reward_points) / 1000) + 1)::INTEGER)
      WHERE id = NEW.player_id;
    END IF;

    UPDATE challenges
    SET current_progress = (
      SELECT COUNT(*) FROM event_participations WHERE challenge_id = NEW.challenge_id
    )
    WHERE id = NEW.challenge_id;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    SELECT * INTO v_challenge FROM challenges WHERE id = OLD.challenge_id;
    SELECT COUNT(*) + 1 INTO v_count_before
    FROM event_participations
    WHERE challenge_id = OLD.challenge_id AND player_id = OLD.player_id;

    IF v_count_before <= v_challenge.target_value THEN
      UPDATE players
      SET
        points = GREATEST(0, points - v_challenge.reward_points),
        level = GREATEST(1, (FLOOR(GREATEST(0, points - v_challenge.reward_points) / 1000) + 1)::INTEGER)
      WHERE id = OLD.player_id;
    END IF;

    UPDATE challenges
    SET current_progress = (
      SELECT COUNT(*) FROM event_participations WHERE challenge_id = OLD.challenge_id
    )
    WHERE id = OLD.challenge_id;

    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER event_participations_points_sync
  AFTER INSERT OR DELETE ON event_participations
  FOR EACH ROW EXECUTE FUNCTION sync_event_challenge_points();

-- 6. Challenge "Teilnahme an Events" einfügen (falls noch nicht vorhanden)
INSERT INTO challenges (title, description, reward_points, target_value, current_progress, deadline, icon, color, challenge_type)
SELECT
  'Teilnahme an Events',
  'Nehmt an 4 Messen oder Events teil und erweitert euer Netzwerk. Tragt eure Eventteilnahmen selbst ein.',
  100,
  4,
  0,
  '2025-12-31',
  '🎪',
  '#8b5cf6',
  'event'
WHERE NOT EXISTS (
  SELECT 1 FROM challenges WHERE challenge_type = 'event' AND title = 'Teilnahme an Events'
);
