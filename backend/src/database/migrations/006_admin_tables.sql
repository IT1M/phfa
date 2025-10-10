-- System Configuration Table
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search Logs Table (if not exists)
CREATE TABLE IF NOT EXISTS search_logs (
  id SERIAL PRIMARY KEY,
  visitor_id INTEGER REFERENCES visitors(id),
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_visitor_id ON search_logs(visitor_id);

-- Insert default system configuration
INSERT INTO system_config (key, value) VALUES
  ('gemini_api_key', ''),
  ('smtp_host', 'smtp.gmail.com'),
  ('smtp_port', '587'),
  ('smtp_user', ''),
  ('smtp_password', ''),
  ('rate_limit_guest', '10'),
  ('rate_limit_auth', '100'),
  ('enable_notifications', 'true'),
  ('enable_analytics', 'true')
ON CONFLICT (key) DO NOTHING;

-- Add status and timing columns to documents if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='documents' AND column_name='started_at') THEN
    ALTER TABLE documents ADD COLUMN started_at TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='documents' AND column_name='completed_at') THEN
    ALTER TABLE documents ADD COLUMN completed_at TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='documents' AND column_name='error_message') THEN
    ALTER TABLE documents ADD COLUMN error_message TEXT;
  END IF;
END $$;
