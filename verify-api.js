// Verification script to test all API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testEndpoint(name, url) {
    try {
        const response = await axios.get(url, { timeout: 10000 });
        console.log(`\n✅ ${name}`);
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
        return { success: true, data: response.data };
    } catch (error) {
        console.log(`\n❌ ${name}`);
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
        return { success: false, error: error.message };
    }
}

async function verifyAPIs() {
    console.log('========================================');
    console.log('API VERIFICATION TEST');
    console.log('========================================');
    
    const results = [];
    
    // Test 1: Health Check
    results.push(await testEndpoint('GET /health', `${API_BASE}/health`));
    
    // Test 2: Jobs
    results.push(await testEndpoint('GET /api/jobs?limit=5', `${API_BASE}/api/jobs?limit=5`));
    
    // Test 3: Featured Jobs
    results.push(await testEndpoint('GET /api/jobs/featured?limit=3', `${API_BASE}/api/jobs/featured?limit=3`));
    
    // Test 4: Courses
    results.push(await testEndpoint('GET /api/courses?limit=5', `${API_BASE}/api/courses?limit=5`));
    
    // Test 5: Categories
    results.push(await testEndpoint('GET /api/jobs/categories', `${API_BASE}/api/jobs/categories`));
    
    // Test 6: Course Categories
    results.push(await testEndpoint('GET /api/courses/categories', `${API_BASE}/api/courses/categories`));
    
    console.log('\n========================================');
    console.log('VERIFICATION SUMMARY');
    console.log('========================================');
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    
    // Check data
    const jobsResult = results[1];
    if (jobsResult.success && jobsResult.data.data) {
        console.log(`\n📊 Jobs Data:`);
        console.log(`   Total jobs: ${jobsResult.data.pagination?.totalCount || jobsResult.data.data.length}`);
        console.log(`   Sample job: ${jobsResult.data.data[0]?.title?.substring(0, 40)}...`);
    }
    
    const coursesResult = results[3];
    if (coursesResult.success && coursesResult.data.data) {
        console.log(`\n📊 Courses Data:`);
        console.log(`   Total courses: ${coursesResult.data.pagination?.totalCount || coursesResult.data.data.length}`);
        console.log(`   Sample course: ${coursesResult.data.data[0]?.title?.substring(0, 40)}...`);
    }
    
    if (failed === 0) {
        console.log('\n🎉 ALL API TESTS PASSED!');
    } else {
        console.log('\n⚠️ SOME TESTS FAILED - Check errors above');
    }
}

verifyAPIs();
