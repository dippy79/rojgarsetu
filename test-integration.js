// Integration test script
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function runTests() {
    console.log('=== ROJGARSETU INTEGRATION TESTS ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Health check
    try {
        const res = await axios.get(`${API_BASE}/health`);
        if (res.status === 200 && res.data.stats) {
            console.log('✅ TEST 1: Health Check');
            console.log(`   Jobs: ${res.data.stats.totalJobs}, Courses: ${res.data.stats.totalCourses}`);
            passed++;
        }
    } catch(e) {
        console.log('❌ TEST 1: Health Check - FAILED');
        failed++;
    }
    
    // Test 2: Jobs endpoint
    try {
        const res = await axios.get(`${API_BASE}/api/jobs?limit=3`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 2: Jobs API');
            console.log(`   Returned ${res.data.data.length} jobs`);
            res.data.data.forEach(j => console.log(`   - ${j.title.substring(0,40)} (${j.category})`));
            passed++;
        } else {
            console.log('\n❌ TEST 2: Jobs API - No data');
            failed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 2: Jobs API - ERROR:', e.message);
        failed++;
    }
    
    // Test 3: Featured Jobs
    try {
        const res = await axios.get(`${API_BASE}/api/jobs/featured?limit=3`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 3: Featured Jobs');
            console.log(`   Returned ${res.data.data.length} featured jobs`);
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 3: Featured Jobs - FAILED');
        failed++;
    }
    
    // Test 4: Courses
    try {
        const res = await axios.get(`${API_BASE}/api/courses?limit=3`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 4: Courses API');
            console.log(`   Returned ${res.data.data.length} courses`);
            res.data.data.forEach(c => console.log(`   - ${c.title.substring(0,40)} (${c.fees})`));
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 4: Courses API - FAILED');
        failed++;
    }
    
    // Test 5: Job Categories
    try {
        const res = await axios.get(`${API_BASE}/api/jobs/categories`);
        if (res.data.data) {
            console.log('\n✅ TEST 5: Job Categories');
            console.log(`   Found ${res.data.data.length} categories`);
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 5: Job Categories - FAILED');
        failed++;
    }
    
    // Test 6: Course Categories
    try {
        const res = await axios.get(`${API_BASE}/api/courses/categories`);
        if (res.data.data) {
            console.log('\n✅ TEST 6: Course Categories');
            console.log(`   Found ${res.data.data.length} categories`);
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 6: Course Categories - FAILED');
        failed++;
    }
    
    // Test 7: Apply Link exists
    try {
        const res = await axios.get(`${API_BASE}/api/jobs?limit=1`);
        const job = res.data.data[0];
        if (job && job.apply_link) {
            console.log('\n✅ TEST 7: Apply Link');
            console.log(`   Job: ${job.title.substring(0,30)}`);
            console.log(`   Apply Link: ${job.apply_link}`);
            passed++;
        } else {
            console.log('\n❌ TEST 7: Apply Link - Missing');
            failed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 7: Apply Link - FAILED');
        failed++;
    }
    
    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Backend is fully functional.');
    } else {
        console.log('\n⚠️ Some tests failed. Please review.');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

runTests();
