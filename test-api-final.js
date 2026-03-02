const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
    console.log('Testing RojgarSetu API Endpoints...\n');
    
    try {
        // Test 1: Health
        console.log('1. Testing /health');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('   ✓ Health:', health.data.status);
        
        // Test 2: Jobs
        console.log('\n2. Testing /api/jobs');
        const jobs = await axios.get(`${BASE_URL}/api/jobs?limit=3`);
        console.log('   ✓ Jobs:', jobs.data.data?.length || 0, 'records');
        
        // Test 3: Featured Jobs
        console.log('\n3. Testing /api/jobs/featured');
        const featured = await axios.get(`${BASE_URL}/api/jobs/featured?limit=3`);
        console.log('   ✓ Featured:', featured.data.data?.length || 0, 'records');
        
        // Test 4: Categories
        console.log('\n4. Testing /api/jobs/categories');
        const categories = await axios.get(`${BASE_URL}/api/jobs/categories`);
        console.log('   ✓ Categories:', categories.data.data?.length || 0);
        
        // Test 5: Courses
        console.log('\n5. Testing /api/courses');
        const courses = await axios.get(`${BASE_URL}/api/courses?limit=3`);
        console.log('   ✓ Courses:', courses.data.data?.length || 0, 'records');
        
        // Test 6: Course Categories
        console.log('\n6. Testing /api/courses/categories');
        const courseCats = await axios.get(`${BASE_URL}/api/courses/categories`);
        console.log('   ✓ Course Categories:', courseCats.data.data?.length || 0);
        
        // Show sample data
        console.log('\n=== SAMPLE DATA ===');
        console.log('\nFeatured Jobs:');
        featured.data.data?.slice(0,2).forEach(j => {
            console.log(`   - ${j.title.substring(0,50)} (${j.category})`);
        });
        
        console.log('\nCourses:');
        courses.data.data?.slice(0,2).forEach(c => {
            console.log(`   - ${c.title} (${c.fees})`);
        });
        
        console.log('\n✅ ALL TESTS PASSED!');
        
    } catch (err) {
        console.error('\n❌ ERROR:', err.message);
        if (err.response) {
            console.error('   Status:', err.response.status);
            console.error('   Data:', err.response.data);
        }
    }
    process.exit(0);
}

testAPI();
