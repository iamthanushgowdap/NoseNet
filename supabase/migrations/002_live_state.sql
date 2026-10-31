-- NoseNet Live State table for real-time synchronization between Main Station and Assessor
CREATE TABLE IF NOT EXISTS nosenet_live_state (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'live_test',
  is_test_running BOOLEAN NOT NULL DEFAULT false,
  selected_cake_type VARCHAR(100) DEFAULT 'Normal Cake — Unfrozen',
  started_at TIMESTAMPTZ,
  test_id VARCHAR(50),
  verdict VARCHAR(50),
  freshness_score NUMERIC(5,2),
  verdict_submitted_at TIMESTAMPTZ,
  assessor_name VARCHAR(100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nosenet_live_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read nosenet_live_state" ON nosenet_live_state;
CREATE POLICY "Public read nosenet_live_state" ON nosenet_live_state
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write nosenet_live_state" ON nosenet_live_state;
CREATE POLICY "Public write nosenet_live_state" ON nosenet_live_state
  FOR ALL USING (true) WITH CHECK (true);

-- Insert singleton row if not exists
INSERT INTO nosenet_live_state (id, is_test_running, selected_cake_type)
VALUES ('live_test', false, 'Normal Cake — Unfrozen')
ON CONFLICT (id) DO NOTHING;
