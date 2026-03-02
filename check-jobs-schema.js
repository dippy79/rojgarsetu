// Check jobs table schema
const { query } = require('./config/database');

async function checkJobsSchema() {
    try {
        const result = await query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'jobs' ORDER BY ordinal_position"
        );
        console.log('Jobs table columns:');
        console.log(result.rows.map(x => x.column_name).join(', '));
        
        // Get stats
        const statsResult = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_government = true THEN 1 ELSE 0 END) as government,
                SUM(CASE WHEN is_government = false THEN 1 ELSE 0 END) as private,
                SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) as featured
            FROM jobs WHERE is_active = true
        `);
        console.log('\nJob Stats:');
        console.log(JSON.stringify(statsResult.rows[0], null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
}

checkJobsSchema();
