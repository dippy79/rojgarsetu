require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'rojgarsetu',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
});

async function check() {
    const client = await pool.connect();
    try {
        // Check if is_government column exists
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'jobs'
        `);
        console.log('Jobs table columns:');
        console.log(columns.rows.map(r => r.column_name).join(', '));
        
        // Check is_government data
        const govJobs = await client.query('SELECT id, title, is_government, category FROM jobs LIMIT 5');
        console.log('\nSample jobs:');
        console.log(JSON.stringify(govJobs.rows, null, 2));
        
        // Count jobs
        const count = await client.query('SELECT COUNT(*) FROM jobs');
        console.log('\nTotal jobs:', count.rows[0].count);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        client.release();
        await pool.end();
    }
}

check();
