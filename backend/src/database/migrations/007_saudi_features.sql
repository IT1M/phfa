-- Saudi Arabia Healthcare Features Migration
-- Adds tables and columns for Saudi-specific functionality

-- Add Saudi-specific columns to users/visitors table
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS phone_saudi VARCHAR(20);
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS national_address JSONB;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS preferred_calendar VARCHAR(10) DEFAULT 'gregorian';
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20);
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS family_access JSONB DEFAULT '[]';

-- Hijri calendar events table
CREATE TABLE IF NOT EXISTS hijri_events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_name_ar VARCHAR(255) NOT NULL,
    hijri_date VARCHAR(20) NOT NULL,
    gregorian_date DATE NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- hajj, ramadan, eid, etc.
    health_alerts JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seasonal health tracking
CREATE TABLE IF NOT EXISTS seasonal_health_data (
    id SERIAL PRIMARY KEY,
    season_type VARCHAR(50) NOT NULL, -- hajj, ramadan, summer, winter
    year INTEGER NOT NULL,
    region VARCHAR(100),
    disease_type VARCHAR(100),
    case_count INTEGER DEFAULT 0,
    severity_level VARCHAR(20),
    recommendations TEXT,
    recommendations_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prayer time medication reminders
CREATE TABLE IF NOT EXISTS prayer_reminders (
    id SERIAL PRIMARY KEY,
    visitor_id INTEGER REFERENCES visitors(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    medication_name_ar VARCHAR(255),
    prayer_time VARCHAR(20) NOT NULL, -- fajr, dhuhr, asr, maghrib, isha
    dosage VARCHAR(100),
    notes TEXT,
    notes_ar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Regional health statistics
CREATE TABLE IF NOT EXISTS regional_health_stats (
    id SERIAL PRIMARY KEY,
    region VARCHAR(100) NOT NULL, -- riyadh, jeddah, makkah, madinah, etc.
    city VARCHAR(100),
    stat_type VARCHAR(100) NOT NULL,
    stat_value NUMERIC,
    stat_date DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MOH compliance logs
CREATE TABLE IF NOT EXISTS moh_compliance_logs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    compliance_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- compliant, non_compliant, pending
    details JSONB,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_by VARCHAR(255)
);

-- SFDA medication database
CREATE TABLE IF NOT EXISTS sfda_medications (
    id SERIAL PRIMARY KEY,
    medication_name VARCHAR(255) NOT NULL,
    medication_name_ar VARCHAR(255) NOT NULL,
    sfda_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100),
    category_ar VARCHAR(100),
    manufacturer VARCHAR(255),
    manufacturer_ar VARCHAR(255),
    warnings TEXT,
    warnings_ar TEXT,
    ramadan_compatible BOOLEAN DEFAULT true,
    hajj_compatible BOOLEAN DEFAULT true,
    heat_sensitive BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- National health insurance records
CREATE TABLE IF NOT EXISTS health_insurance (
    id SERIAL PRIMARY KEY,
    visitor_id INTEGER REFERENCES visitors(id) ON DELETE CASCADE,
    insurance_provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    coverage_type VARCHAR(100),
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergency services connectivity
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id SERIAL PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- ambulance, hospital, clinic
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    address_ar TEXT,
    coordinates JSONB, -- {lat, lng}
    available_24_7 BOOLEAN DEFAULT false,
    specialties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_hijri_events_date ON hijri_events(gregorian_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_health_season ON seasonal_health_data(season_type, year);
CREATE INDEX IF NOT EXISTS idx_prayer_reminders_visitor ON prayer_reminders(visitor_id);
CREATE INDEX IF NOT EXISTS idx_regional_stats_region ON regional_health_stats(region, stat_date);
CREATE INDEX IF NOT EXISTS idx_sfda_code ON sfda_medications(sfda_code);
CREATE INDEX IF NOT EXISTS idx_emergency_region ON emergency_contacts(region);

-- Insert sample Hijri events
INSERT INTO hijri_events (event_name, event_name_ar, hijri_date, gregorian_date, event_type, health_alerts) VALUES
('Ramadan Start', 'بداية رمضان', '1 Ramadan 1446', '2025-03-01', 'ramadan', '{"fasting_health": true, "medication_timing": true}'),
('Hajj Season', 'موسم الحج', '8 Dhul Hijjah 1446', '2025-06-05', 'hajj', '{"heat_stroke": true, "crowd_safety": true, "vaccination": true}'),
('Eid Al-Fitr', 'عيد الفطر', '1 Shawwal 1446', '2025-03-31', 'eid', '{"dietary_changes": true}'),
('Eid Al-Adha', 'عيد الأضحى', '10 Dhul Hijjah 1446', '2025-06-07', 'eid', '{"food_safety": true}')
ON CONFLICT DO NOTHING;

-- Insert sample emergency contacts
INSERT INTO emergency_contacts (region, service_type, name, name_ar, phone, available_24_7) VALUES
('Riyadh', 'ambulance', 'Saudi Red Crescent - Riyadh', 'الهلال الأحمر السعودي - الرياض', '997', true),
('Jeddah', 'ambulance', 'Saudi Red Crescent - Jeddah', 'الهلال الأحمر السعودي - جدة', '997', true),
('Makkah', 'ambulance', 'Saudi Red Crescent - Makkah', 'الهلال الأحمر السعودي - مكة', '997', true),
('Madinah', 'ambulance', 'Saudi Red Crescent - Madinah', 'الهلال الأحمر السعودي - المدينة', '997', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE hijri_events IS 'Islamic calendar events with health alerts';
COMMENT ON TABLE seasonal_health_data IS 'Seasonal disease patterns and health statistics';
COMMENT ON TABLE prayer_reminders IS 'Medication reminders aligned with prayer times';
COMMENT ON TABLE regional_health_stats IS 'Regional health statistics for Saudi cities';
COMMENT ON TABLE moh_compliance_logs IS 'MOH compliance tracking for documents';
COMMENT ON TABLE sfda_medications IS 'SFDA-approved medication database';
COMMENT ON TABLE health_insurance IS 'National health insurance records';
COMMENT ON TABLE emergency_contacts IS 'Emergency services by region';
