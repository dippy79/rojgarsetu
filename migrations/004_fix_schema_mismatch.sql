-- 004_fix_schema_mismatch.sql - Fix schema mismatch issues
-- Add missing columns that controllers expect

-- Add organization column (already added in 002)
-- Add content_hash for duplicate detection
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

-- Add posted_date if not exists
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add criteria as alias for eligibility_criteria (if needed)
-- Note: PostgreSQL doesn't support alias columns, use VIEW instead

-- Make sure is_government column exists (already in 002)
-- Add is_government default to true for existing records where category is Government/Banking/Defence
UPDATE jobs SET is_government = true 
WHERE category IN ('Government', 'Banking', 'Defence') 
AND is_government IS NULL;

-- Add unique constraint for duplicate prevention (using source and source_url)
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_source_url_unique 
ON jobs(source, source_url) 
WHERE source IS NOT NULL AND source_url IS NOT NULL;

-- Add company column for easier querying (maps to company_profiles)
-- This is already handled via company_id FK

-- Fix: Add default value for is_government
ALTER TABLE jobs ALTER COLUMN is_government SET DEFAULT false;

COMMIT;

