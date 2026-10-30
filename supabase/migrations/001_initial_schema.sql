-- NoseNet: IoT-Based Cake Freshness and Adulteration Testing System
-- Supabase / PostgreSQL Database Schema for Multi-Device Independent Assessment

CREATE TABLE IF NOT EXISTS test_assessment_sessions (
  token VARCHAR(64) PRIMARY KEY,
  test_id VARCHAR(50) NOT NULL,
  sample_id VARCHAR(50) NOT NULL,
  cake_category VARCHAR(30) NOT NULL CHECK (cake_category IN ('Normal cake', 'Pastry cake')),
  storage_condition VARCHAR(30) NOT NULL CHECK (storage_condition IN ('Frozen', 'Unfrozen')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Submitted', 'Expired'))
);

CREATE TABLE IF NOT EXISTS independent_assessments (
  id VARCHAR(64) PRIMARY KEY,
  test_id VARCHAR(50) NOT NULL,
  token VARCHAR(64) NOT NULL REFERENCES test_assessment_sessions(token) ON DELETE CASCADE,
  visual_condition VARCHAR(20) NOT NULL CHECK (visual_condition IN ('Normal', 'Changed', 'Unsure')),
  smell_assessment VARCHAR(20) NOT NULL CHECK (smell_assessment IN ('Normal', 'Changed', 'Unsure')),
  human_assessment VARCHAR(30) NOT NULL CHECK (human_assessment IN ('Appears normal', 'Possible change', 'Cannot determine')),
  confidence VARCHAR(10) CHECK (confidence IN ('Low', 'Medium', 'High')),
  observations TEXT,
  assessor_identifier VARCHAR(50),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE test_assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE independent_assessments ENABLE ROW LEVEL SECURITY;

-- Allow public read access to an active token session by its exact token
CREATE POLICY "Public token lookup" ON test_assessment_sessions
  FOR SELECT
  USING (true);

-- Allow public insertion of assessment with valid token
CREATE POLICY "Public assessment submission" ON independent_assessments
  FOR INSERT
  WITH CHECK (true);

-- Allow reading submitted assessments
CREATE POLICY "Public assessment read" ON independent_assessments
  FOR SELECT
  USING (true);
