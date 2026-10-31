-- Historical log of all finalized tests stored permanently in Supabase
CREATE TABLE IF NOT EXISTS nosenet_test_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id VARCHAR(50) NOT NULL,
  cake_type VARCHAR(100) NOT NULL,
  verdict VARCHAR(50) NOT NULL,
  freshness_score NUMERIC(5,2) NOT NULL,
  assessor_name VARCHAR(100),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE nosenet_test_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read test history" ON nosenet_test_history;
CREATE POLICY "Public read test history" ON nosenet_test_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert test history" ON nosenet_test_history;
CREATE POLICY "Public insert test history" ON nosenet_test_history
  FOR INSERT WITH CHECK (true);
