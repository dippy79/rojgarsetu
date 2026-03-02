const fs = require('fs');
const { query, pool } = require('./config/database');

async function runMigration() {
  const migrationPath = './migrations/002_add_government_flag.sql';
  
  try {
    console.log('Running migration 002...');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Use a client to run all statements in a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Execute each ALTER TABLE statement
      await client.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_government BOOLEAN DEFAULT false');
      console.log('  ✓ Added is_government column');
      
      await client.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS organization VARCHAR(255)');
      console.log('  ✓ Added organization column');
      
      await client.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_link VARCHAR(500)');
      console.log('  ✓ Added apply_link column');
      
      await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_is_government ON jobs(is_government)');
      console.log('  ✓ Created is_government index');
      
      await client.query('CREATE INDEX IF NOT EXISTS idx_jobs_apply_link ON jobs(apply_link)');
      console.log('  ✓ Created apply_link index');
      
      await client.query('ALTER TABLE courses ADD COLUMN IF NOT EXISTS provider VARCHAR(255)');
      console.log('  ✓ Added provider column to courses');
      
      await client.query('COMMIT');
      console.log('\n✓ Migration 002 completed successfully!');
      
      // Verify the column was added
      const result = await query("SELECT column_name FROM information_schema.columns WHERE table_name='jobs' AND column_name='is_government'");
      if (result.rows.length > 0) {
        console.log('✓ is_government column now exists in jobs table');
      }
      
    } finally {
      client.release();
    }
    
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
  
  process.exit(0);
}

runMigration();
