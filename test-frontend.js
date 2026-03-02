// Frontend Integration Test
const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:5000';

async function testFrontend() {
    console.log('=== FRONTEND INTEGRATION TESTS ===\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Frontend loads
    try {
        const res = await axios.get(FRONTEND_URL, { timeout: 10000 });
        if (res.status === 200) {
            console.log('✅ TEST 1: Frontend loads');
            console.log(`   Status: ${res.status}`);
            console.log(`   Content length: ${res.data.length} bytes`);
            passed++;
        }
    } catch(e) {
        console.log('❌ TEST 1: Frontend loads - FAILED:', e.message);
        failed++;
    }
    
    // Test 2: Frontend has API connection
    try {
        const apiTest = await axios.get(`${API_BASE}/api/jobs?limit=1`);
        console.log('\n✅ TEST 2: Backend API accessible from frontend context');
        console.log(`   Jobs endpoint working: ${apiTest.data.data?.length >= 0}`);
        passed++;
    } catch(e) {
        console.log('\n❌ TEST 2: Backend API - FAILED');
        failed++;
    }
    
    // Test 3: Jobs data has proper structure for frontend
    try {
        const res = await axios.get(`${API_BASE}/api/jobs?limit=1`);
        const job = res.data.data[0];
        
        const hasTitle = !!job.title;
        const hasCategory = !!job.category;
        const hasLocation = !!job.location;
        const hasApplyLink = !!job.apply_link;
        
        if (hasTitle && hasCategory && hasLocation && hasApplyLink) {
            console.log('\n✅ TEST 3: Job data structure for frontend');
            console.log(`   Title: ${job.title?.substring(0,30)}`);
            console.log(`   Category: ${job.category}`);
            console.log(`   Location: ${job.location}`);
            console.log(`   Apply Link: ${job.apply_link ? '✓ Present' : '✗ Missing'}`);
            passed++;
        } else {
            console.log('\n❌ TEST 3: Job data structure - Incomplete');
            failed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 3: Job data structure - FAILED');
        failed++;
    }
    
    // Test 4: Featured jobs for homepage
    try {
        const res = await axios.get(`${API_BASE}/api/jobs/featured?limit=3`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 4: Featured jobs for homepage');
            console.log(`   Featured jobs count: ${res.data.data.length}`);
            passed++;
        } else {
            console.log('\n❌ TEST 4: Featured jobs - Empty');
            failed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 4: Featured jobs - FAILED');
        failed++;
    }
    
    // Test 5: Courses for homepage
    try {
        const res = await axios.get(`${API_BASE}/api/courses?limit=3`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 5: Courses for homepage');
            console.log(`   Courses count: ${res.data.data.length}`);
            passed++;
        } else {
            console.log('\n❌ TEST 5: Courses - Empty');
            failed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 5: Courses - FAILED');
        failed++;
    }
    
    // Test 6: Categories for filters
    try {
        const res = await axios.get(`${API_BASE}/api/jobs/categories`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 6: Categories for filters');
            console.log(`   Categories: ${res.data.data.join(', ')}`);
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 6: Categories - FAILED');
        failed++;
    }
    
    // Test 7: Government Jobs section
    try {
        const res = await axios.get(`${API_BASE}/api/jobs?is_government=true&limit=3`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 7: Government Jobs section');
            console.log(`   Government jobs: ${res.data.data.length}`);
            res.data.data.forEach(j => console.log(`   - ${j.title?.substring(0,35)}`));
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 7: Government Jobs - FAILED');
        failed++;
    }
    
    // Test 8: Private Jobs section
    try {
        const res = await axios.get(`${API_BASE}/api/jobs?is_government=false&limit=3`);
        if (res.data.data && res.data.data.length > 0) {
            console.log('\n✅ TEST 8: Private Jobs section');
            console.log(`   Private jobs: ${res.data.data.length}`);
            res.data.data.forEach(j => console.log(`   - ${j.title?.substring(0,35)}`));
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 8: Private Jobs - FAILED');
        failed++;
    }
    
    // Test 9: Apply button functionality (link valid)
    try {
        const res = await axios.get(`${API_BASE}/api/jobs?limit=5`);
        const jobsWithLinks = res.data.data.filter(j => j.apply_link && j.apply_link.startsWith('http'));
        
        if (jobsWithLinks.length > 0) {
            console.log('\n✅ TEST 9: Apply button links');
            console.log(`   Jobs with valid apply links: ${jobsWithLinks.length}/${res.data.data.length}`);
            passed++;
        } else {
            console.log('\n❌ TEST 9: Apply button links - No valid links');
            failed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 9: Apply button - FAILED');
        failed++;
    }
    
    // Test 10: Pagination works
    try {
        const page1 = await axios.get(`${API_BASE}/api/jobs?page=1&limit=3`);
        const page2 = await axios.get(`${API_BASE}/api/jobs?page=2&limit=3`);
        
        if (page1.data.data[0].id !== page2.data.data[0].id) {
            console.log('\n✅ TEST 10: Pagination');
            console.log(`   Page 1 and Page 2 have different data`);
            passed++;
        }
    } catch(e) {
        console.log('\n❌ TEST 10: Pagination - FAILED');
        failed++;
    }
    
    // Summary
    console.log('\n=== FRONTEND INTEGRATION SUMMARY ===');
    console.log(`Passed: ${passed}/10`);
    console.log(`Failed: ${failed}/10`);
    
    if (failed === 0) {
        console.log('\n🎉 ALL FRONTEND TESTS PASSED!');
        console.log('✅ Database → API → Frontend data flow is working!');
    } else {
        console.log('\n⚠️ Some tests failed.');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

testFrontend();
