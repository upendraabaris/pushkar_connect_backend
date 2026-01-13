-- MLA Public Engagement Platform - Database Schema
-- Run this SQL script in pgAdmin to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Staff Management Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- 'admin', 'staff', 'citizen'
    phone VARCHAR(20),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MLA Profile Table
CREATE TABLE IF NOT EXISTS mla_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    constituency VARCHAR(255),
    party VARCHAR(255),
    designation TEXT,
    bio TEXT,
    social_media JSONB, -- {twitter: "", facebook: "", instagram: ""}
    contact_info JSONB, -- {office_address: "", phone: "", email: ""}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated unique ID
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(20),
    citizen_email VARCHAR(255),
    citizen_address TEXT,
    category VARCHAR(100) NOT NULL, -- e.g., 'Water', 'Electricity', 'Road', 'Sanitation'
    subcategory VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved', 'rejected'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    location JSONB, -- {latitude: 0, longitude: 0, address: ""}
    images TEXT[], -- Array of image URLs
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Development Works Table
CREATE TABLE IF NOT EXISTS development_works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- 'Road', 'Building', 'Infrastructure', 'Water', 'Electricity'
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'on_hold'
    budget_amount DECIMAL(15, 2),
    allocated_amount DECIMAL(15, 2),
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    location JSONB, -- {latitude: 0, longitude: 0, address: "", ward: "", area: ""}
    start_date DATE,
    completion_date DATE,
    estimated_completion_date DATE,
    contractor_name VARCHAR(255),
    contractor_contact VARCHAR(100),
    images TEXT[],
    videos TEXT[],
    documents TEXT[],
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'Public Meeting', 'Inauguration', 'Awareness Campaign', 'Celebration'
    event_date DATE NOT NULL,
    event_time TIME,
    end_date DATE,
    end_time TIME,
    location VARCHAR(500),
    location_coordinates JSONB, -- {latitude: 0, longitude: 0}
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
    expected_attendance INTEGER,
    actual_attendance INTEGER,
    images TEXT[],
    videos TEXT[],
    agenda TEXT,
    organized_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Management Table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(500),
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document'
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category VARCHAR(100), -- 'Press Release', 'News Coverage', 'Event', 'Development Work', 'General'
    tags TEXT[],
    source VARCHAR(255), -- News source or origin
    published_date DATE,
    is_featured BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart City / Schemes Table
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'Smart City', 'Government Scheme', 'Welfare', 'Infrastructure'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'pending', 'completed', 'discontinued'
    eligibility_criteria TEXT,
    benefits TEXT,
    application_process TEXT,
    documents_required TEXT[],
    official_link TEXT,
    contact_info JSONB,
    start_date DATE,
    end_date DATE,
    images TEXT[],
    documents TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MLA Connect (Public Queries/Feedback) Table
CREATE TABLE IF NOT EXISTS mla_connect (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_id VARCHAR(50) UNIQUE NOT NULL,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(20),
    citizen_email VARCHAR(255),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    type VARCHAR(50), -- 'query', 'suggestion', 'feedback', 'request'
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'acknowledged', 'responded', 'closed'
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    response TEXT,
    responded_at TIMESTAMP,
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50), -- 'complaint', 'event', 'work', 'system'
    reference_id UUID, -- Reference to related entity (complaint_id, event_id, etc.)
    reference_type VARCHAR(50), -- Type of reference ('complaint', 'event', 'work')
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50), -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP Table for Email Verification
CREATE TABLE IF NOT EXISTS otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(50) NOT NULL, -- 'login', 'registration', 'password_reset'
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);

CREATE INDEX IF NOT EXISTS idx_development_works_status ON development_works(status);
CREATE INDEX IF NOT EXISTS idx_development_works_assigned_to ON development_works(assigned_to);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
CREATE INDEX IF NOT EXISTS idx_otps_code ON otps(otp_code);
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mla_profile_updated_at BEFORE UPDATE ON mla_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_development_works_updated_at BEFORE UPDATE ON development_works FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schemes_updated_at BEFORE UPDATE ON schemes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mla_connect_updated_at BEFORE UPDATE ON mla_connect FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - change this after first login)
-- Password hash for 'admin123' using bcrypt (you should change this)
INSERT INTO users (id, name, email, password_hash, role, is_active) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Admin User',
    'admin@mla.gov.in',
    '$2b$10$rOzJqO1qHJvqJzqJzqJzqO1qHJvqJzqJzqJzqJzqJzqJzqJzqJzq', -- Change this! Use actual bcrypt hash
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Sample data (optional - remove if not needed)
-- You can insert sample data here for testing
