// test-api.js - Test API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
    console.log('\n=== Testing RojgarSetu API ===\n');
    
    try {
        // Test 1: Health endpoint
        console.log('1. Testing /health...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('   Status:', health.data.status);
        console.log('   Database:', health.data.database);
        console.log('   Jobs:', health.data.stats?.totalJobs || 'N/A');
        console.log('   Courses:', health.data.stats?.totalCourses || 'N/A');
        
        // Test 2: Jobs endpoint
        console.log('\n2. Testing /api/jobs?limit=3...');
        const jobs = await axios.get(`${BASE_URL}/api/jobs?limit=3`);
        console.log('   Success:', jobs.data.success);
        console.log('   Total Jobs:', jobs.data.pagination?.totalCount);
        console.log('   Sample job:', jobs.data.data?.[0]?.title || 'N/A');
        
        // Test 3: Featured jobs
        console.log('\n3. Testing /api/jobs/featured?limit=3...');
        const featured = await axios.get(`${BASE_URL}/api/jobs/featured?limit=3`);
        console.log('   Success:', featured.data.success);
        console.log('   Featured count:', featured.data.data?.length || 0);
        
        // Test 4: Courses
        console.log('\n4. Testing /api/courses?limit=3...');
        const courses = await axios.get(`${BASE_URL}/api/courses?limit=3`);
        console.log('   Success:', courses.data.success);
        console.log('   Total Courses:', courses.data.pagination?.totalCount);
        console.log('   Sample course:', courses.data.data?.[0]?.title || 'N/A');
        
        // Test 5: Categories
        console.log('\n5. Testing /api/jobs/categories...');
        const categories = await axios.get(`${BASE_URL}/api/jobs/categories`);
        console.log('   Success:', categories.data.success);
        console.log('   Categories:', categories.data.data?.length || 0);
        
        console.log('\n=== All Tests Passed! ===\n');
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

testAPI();
