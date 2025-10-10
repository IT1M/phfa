-- Security Tables Migration

-- MFA Tokens Table
CREATE TABLE IF NOT EXISTS mfa_tokens (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  method VARCHAR(20) NOT NULL CHECK (method IN ('email', 'sms', 'totp')),
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mfa_tokens_expires ON mfa_tokens(expires_at);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- IP Whitelist Table
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  role VARCHAR(20) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ip_address, role)
);

CREATE INDEX idx_ip_whitelist_role ON ip_whitelist(role);

-- Security Threats Table
CREATE TABLE IF NOT EXISTS security_threats (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  level VARCHAR(20) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_security_threats_type ON security_threats(type);
CREATE INDEX idx_security_threats_level ON security_threats(level);
CREATE INDEX idx_security_threats_timestamp ON security_threats(timestamp);

-- Data Retention Logs Table
CREATE TABLE IF NOT EXISTS data_retention_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_retention_logs_resource ON data_retention_logs(resource, resource_id);

-- Patient Assignments Table (for nurse access control)
CREATE TABLE IF NOT EXISTS patient_assignments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(patient_id, user_id)
);

CREATE INDEX idx_patient_assignments_patient ON patient_assignments(patient_id);
CREATE INDEX idx_patient_assignments_user ON patient_assignments(user_id);

-- Add security columns to existing tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_method VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

ALTER TABLE patients ADD COLUMN IF NOT EXISTS anonymized BOOLEAN DEFAULT false;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMP;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Temp Files Table (for cleanup)
CREATE TABLE IF NOT EXISTS temp_files (
  id SERIAL PRIMARY KEY,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_temp_files_created ON temp_files(created_at);

-- Backup Metadata Table
CREATE TABLE IF NOT EXISTS backup_metadata (
  id SERIAL PRIMARY KEY,
  backup_path TEXT NOT NULL,
  checksum VARCHAR(255) NOT NULL,
  size_bytes BIGINT NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_backup_metadata_created ON backup_metadata(created_at);
