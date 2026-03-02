require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'rojgarsetu',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
});

async function fixJobs() {
    const client = await pool.connect();
    try {
        // First see the full structure
        const jobs = await client.query('SELECT id, title, source, organization, category, is_government FROM jobs LIMIT 10');
        console.log('Current jobs:');
        console.log(JSON.stringify(jobs.rows, null, 2));
        
        // Update is_government based on category
        const updateGov = await client.query(`
            UPDATE jobs 
            SET is_government = true 
            WHERE category = 'Government' AND is_government = false
        `);
        console.log(`\nUpdated ${updateGov.rowCount} government jobs`);
        
        // Update organization from source if empty
        const updateOrg = await client.query(`
            UPDATE jobs 
            SET organization = source 
            WHERE (organization IS NULL OR organization = '') AND source IS NOT NULL
        `);
        console.log(`Updated ${updateOrg.rowCount} organizations from source`);
        
        // Verify updates
        const verify = await client.query('SELECT id, title, organization, category, is_government FROM jobs LIMIT 10');
        console.log('\nAfter update:');
        console.log(JSON.stringify(verify.rows, null, 2));
        
        // Get stats
        const stats = await client.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_government = true THEN 1 ELSE 0 END) as government,
                SUM(CASE WHEN is_government = false THEN 1 ELSE 0 END) as private
            FROM jobs
        `);
        console.log('\nStats:', stats.rows[0]);
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fixJobs();
