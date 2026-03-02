-- 002_add_government_flag.sql - Add is_government column to jobs table

-- Add is_government column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_government BOOLEAN DEFAULT false;

-- Add organization column (for government job sources like SSC, UPSC, etc.)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS organization VARCHAR(255);

-- Add apply_link column (for external application URLs)
-- Note: This might already exist as apply_link, check and rename if needed
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_link VARCHAR(500);

-- Create index on is_government for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_is_government ON jobs(is_government);

-- Create index on apply_link for duplicate detection
CREATE INDEX IF NOT EXISTS idx_jobs_apply_link ON jobs(apply_link);

-- Add organization column to courses table if not exists
ALTER TABLE courses ADD COLUMN IF NOT EXISTS provider VARCHAR(255);

COMMIT;
