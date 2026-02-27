// migrations/run_migrations.js - Database migration runner
const fs = require('fs');
const path = require('path');
const { pool, query } = require('../config/database');

async function runMigrations() {
    console.log('Starting database migrations...\n');

    try {
        // Create migrations tracking table
        await query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get list of executed migrations
        const { rows: executedMigrations } = await query('SELECT filename FROM migrations');
        const executedFiles = new Set(executedMigrations.map(row => row.filename));

        // Read all migration files
        const migrationsDir = __dirname;
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            if (executedFiles.has(file)) {
                console.log(`✓ Skipping ${file} (already executed)`);
                continue;
            }

            console.log(`\n→ Executing ${file}...`);
            
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            // Execute migration in a transaction
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query(
                    'INSERT INTO migrations (filename) VALUES ($1)',
                    [file]
                );
                await client.query('COMMIT');
                console.log(`✓ ${file} executed successfully`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`✗ Error executing ${file}:`, err.message);
                throw err;
            } finally {
                client.release();
            }
        }

        console.log('\n✅ All migrations completed successfully!');
        
        // Show database stats
        console.log('\n📊 Database Statistics:');
        const tables = ['users', 'candidate_profiles', 'company_profiles', 'jobs', 'courses', 'job_applications'];
        for (const table of tables) {
            try {
                const { rows } = await query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`  ${table}: ${rows[0].count} rows`);
            } catch (err) {
                // Table might not exist yet
            }
        }

    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };
