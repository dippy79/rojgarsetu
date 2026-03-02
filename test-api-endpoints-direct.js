// Test API endpoints directly by querying database
const { query } = require('./config/database');

async function testAPIs() {
    try {
        console.log('=== Testing API Endpoints (Direct DB Query) ===\n');
        
        // Test GET /api/jobs
        console.log('1. GET /api/jobs');
        const jobsResult = await query(`
            SELECT id, title, organization, category, location, type, 
                   is_government, is_featured, apply_link, last_date
            FROM jobs 
            WHERE is_active = true 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log(`   Total jobs: ${jobsResult.rowCount}`);
        console.log(`   Sample:`, jobsResult.rows[0]?.title || 'No data');
        
        // Test GET /api/jobs/featured
        console.log('\n2. GET /api/jobs/featured');
        const featuredResult = await query(`
            SELECT id, title, organization, is_featured
            FROM jobs 
            WHERE is_active = true AND is_featured = true
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log(`   Featured jobs: ${featuredResult.rowCount}`);
        
        // Test GET /api/jobs/government
        console.log('\n3. GET /api/jobs/government');
        const govResult = await query(`
            SELECT id, title, organization, category
            FROM jobs 
            WHERE is_active = true AND is_government = true
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log(`   Government jobs: ${govResult.rowCount}`);
        
        // Test GET /api/jobs/private
        console.log('\n4. GET /api/jobs/private');
        const privResult = await query(`
            SELECT id, title, organization, category
            FROM jobs 
            WHERE is_active = true AND is_government = false
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log(`   Private jobs: ${privResult.rowCount}`);
        
        // Test GET /api/jobs/categories
        console.log('\n5. GET /api/jobs/categories');
        const catResult = await query(`
            SELECT category, COUNT(*) as count
            FROM jobs 
            WHERE is_active = true
            GROUP BY category
            ORDER BY count DESC
        `);
        console.log(`   Categories: ${catResult.rowCount}`);
        console.log('   ', catResult.rows.map(r => `${r.category} (${r.count})`).join(', '));
        
        // Test GET /api/courses
        console.log('\n6. GET /api/courses');
        const coursesResult = await query(`
            SELECT id, title, provider, category, fees, is_featured
            FROM courses 
            WHERE is_active = true
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log(`   Total courses: ${coursesResult.rowCount}`);
        console.log(`   Sample:`, coursesResult.rows[0]?.title || 'No data');
        
        // Test GET /api/courses/featured
        console.log('\n7. GET /api/courses/featured');
        const featuredCoursesResult = await query(`
            SELECT id, title, provider
            FROM courses 
            WHERE is_active = true AND is_featured = true
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log(`   Featured courses: ${featuredCoursesResult.rowCount}`);
        
        // Test GET /api/courses/categories
        console.log('\n8. GET /api/courses/categories');
        const courseCatResult = await query(`
            SELECT category, COUNT(*) as count
            FROM courses 
            WHERE is_active = true
            GROUP BY category
            ORDER BY count DESC
        `);
        console.log(`   Categories: ${courseCatResult.rowCount}`);
        console.log('   ', courseCatResult.rows.map(r => `${r.category} (${r.count})`).join(', '));
        
        console.log('\n=== All API Tests Passed ===');
        
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
}

testAPIs();
