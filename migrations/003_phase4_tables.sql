-- 003_phase4_tables.sql - Phase 4 Database Schema
-- Contains: resumes, audit_logs, admin_profiles, job_recommendations, user_sessions, referrals
-- Also extends: users.role, candidate new fields

--_profiles with Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. EXTEND USERS TABLE - Add super_admin role
-- ============================================

-- First, update the CHECK constraint to include super_admin
-- Note: This is a safe additive change - we drop and recreate with more values
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'candidate', 'company', 'super_admin'));

-- Add last_login field for tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add is_super_admin flag for quick lookups
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- ============================================
-- 2. EXTEND CANDIDATE_PROFILES TABLE
-- ============================================

-- Add skill_tags as array
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS skill_tags TEXT[];

-- Add preferred_job_categories as array
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS preferred_job_categories VARCHAR(100)[];

-- Add resume_headline
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS resume_headline VARCHAR(255);

-- Add total_experience_years
ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS total_experience_years INTEGER;

-- ============================================
-- 3. RESUMES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    is_parsed BOOLEAN DEFAULT false,
    parsed_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resumes_candidate_id ON resumes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_resumes_is_primary ON resumes(is_primary);

-- ============================================
-- 4. AUDIT_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'warning')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 5. ADMIN_PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    admin_level VARCHAR(50) NOT NULL CHECK (admin_level IN ('super_admin', 'admin', 'moderator', 'viewer')),
    permissions JSONB DEFAULT '{}',
    assigned_regions VARCHAR(255)[],
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_level ON admin_profiles(admin_level);

-- ============================================
-- 6. JOB_RECOMMENDATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS job_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    score DECIMAL(5,2) DEFAULT 0,
    match_reason TEXT,
    is_relevant BOOLEAN DEFAULT true,
    is_dismissed BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP,
    applied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_recommendations_candidate_id ON job_recommendations(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_job_id ON job_recommendations(job_id);
CREATE INDEX IF NOT EXISTS idx_job_recommendations_score ON job_recommendations(score DESC);

-- ============================================
-- 7. USER_SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ============================================
-- 8. REFERRALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    reward_points INTEGER DEFAULT 0,
    reward_claimed BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
    referred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    converted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);

-- ============================================
-- 9. EXTEND JOB_APPLICATIONS TABLE
-- ============================================

ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS screening_score INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS screening_notes TEXT;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS interview_mode VARCHAR(50);
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS offer_salary INTEGER;
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS offer_date TIMESTAMP;

-- ============================================
-- 10. COMPANY EXTENSIONS
-- ============================================

ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS total_jobs_posted INTEGER DEFAULT 0;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS total_hires INTEGER DEFAULT 0;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;

-- ============================================
-- 11. CREATE AUDIT LOG TRIGGER FUNCTION
-- ============================================

-- Function to automatically log important changes
CREATE OR REPLACE FUNCTION log_audit_action()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, status)
        VALUES (NEW.user_id, TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(NEW), 'success');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, status)
        VALUES (COALESCE(NEW.user_id, OLD.user_id), TG_OP, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), 'success');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, status)
        VALUES (OLD.user_id, TG_OP, TG_TABLE_NAME, OLD.id, to_jsonb(OLD), 'success');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ============================================
-- 12. UPDATE TRIGGER FOR updated_at
-- ============================================

CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. INSERT SUPER ADMIN USER (Sample)
-- ============================================

-- Note: Password hash for 'superadmin123' - CHANGE IN PRODUCTION
-- This is a placeholder - in production, use proper bcrypt hash
-- INSERT INTO users (email, password_hash, role, is_active, email_verified, is_super_admin) 
-- VALUES ('superadmin@rojgarsetu.com', '$2a$10$YourSuperAdminHash', 'super_admin', true, true, true)
-- ON CONFLICT (email) DO NOTHING;

COMMIT;

