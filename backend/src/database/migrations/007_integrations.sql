-- Integration and Webhook Tables

-- Integration configurations table
CREATE TABLE IF NOT EXISTS integration_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    base_url VARCHAR(500) NOT NULL,
    api_key TEXT,
    credentials JSONB,
    timeout INTEGER DEFAULT 30000,
    retry_attempts INTEGER DEFAULT 3,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    retry_attempts INTEGER DEFAULT 3,
    headers JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook delivery logs
CREATE TABLE IF NOT EXISTS webhook_logs (
    id SERIAL PRIMARY KEY,
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    attempts INTEGER NOT NULL,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration audit logs
CREATE TABLE IF NOT EXISTS integration_audit_logs (
    id SERIAL PRIMARY KEY,
    integration_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(50) NOT NULL,
    error TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_integration_audit_logs_integration ON integration_audit_logs(integration_name);
CREATE INDEX IF NOT EXISTS idx_integration_audit_logs_created_at ON integration_audit_logs(created_at);

-- Insert default integration configurations (disabled by default)
INSERT INTO integration_configs (name, type, base_url, enabled) VALUES
    ('Saudi MOH', 'moh', 'https://api.moh.gov.sa/v1', false),
    ('Hospital Information System', 'his', 'http://localhost:8080', false),
    ('Laboratory Information System', 'lis', 'http://localhost:8081', false),
    ('Pharmacy Management System', 'pharmacy', 'http://localhost:8082', false)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE integration_configs IS 'External healthcare system integration configurations';
COMMENT ON TABLE webhooks IS 'Webhook subscriptions for event notifications';
COMMENT ON TABLE webhook_logs IS 'Webhook delivery attempt logs';
COMMENT ON TABLE integration_audit_logs IS 'Audit trail for all integration API calls';
