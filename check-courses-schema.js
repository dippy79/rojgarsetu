// Check courses table schema
const { query } = require('./config/database');

async function checkCoursesSchema() {
    try {
        const result = await query(
            "SELECT column_name FROM information_schema.columns WHERE table_name = 'courses' ORDER BY ordinal_position"
        );
        console.log('Courses table columns:');
        console.log(result.rows.map(x => x.column_name).join(', '));
        
        // Check if there's data
        const countResult = await query("SELECT COUNT(*) FROM courses");
        console.log('\nTotal courses:', countResult.rows[0].count);
        
        // Get sample course
        if (parseInt(countResult.rows[0].count) > 0) {
            const sampleResult = await query("SELECT * FROM courses LIMIT 1");
            console.log('\nSample course:');
            console.log(JSON.stringify(sampleResult.rows[0], null, 2));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
}

checkCoursesSchema();
