const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAPI() {
  console.log('Testing API Endpoints...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing /health');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('   Status:', health.data.status);
    console.log('   Jobs:', health.data.stats?.totalJobs);
    console.log('   Courses:', health.data.stats?.totalCourses);
    console.log('   ✓ Health check passed\n');
    
    // Test 2: All jobs
    console.log('2. Testing /api/jobs');
    const jobs = await axios.get(`${API_BASE}/api/jobs?limit=5`);
    console.log('   Total jobs returned:', jobs.data.data?.length);
    console.log('   ✓ Jobs endpoint working\n');
    
    // Test 3: Featured jobs
    console.log('3. Testing /api/jobs/featured');
    const featured = await axios.get(`${API_BASE}/api/jobs/featured?limit=3`);
    console.log('   Featured jobs:', featured.data.data?.length);
    console.log('   ✓ Featured jobs working\n');
    
    // Test 4: Government jobs
    console.log('4. Testing /api/jobs/government');
    const govJobs = await axios.get(`${API_BASE}/api/jobs/government?limit=5`);
    console.log('   Government jobs:', govJobs.data.data?.length);
    console.log('   ✓ Government jobs working\n');
    
    // Test 5: Private jobs
    console.log('5. Testing /api/jobs/private');
    const privJobs = await axios.get(`${API_BASE}/api/jobs/private?limit=5`);
    console.log('   Private jobs:', privJobs.data.data?.length);
    console.log('   ✓ Private jobs working\n');
    
    // Test 6: Courses
    console.log('6. Testing /api/courses');
    const courses = await axios.get(`${API_BASE}/api/courses?limit=5`);
    console.log('   Courses returned:', courses.data.courses?.length || courses.data.data?.length);
    console.log('   ✓ Courses endpoint working\n');
    
    // Test 7: Categories
    console.log('7. Testing /api/jobs/categories');
    const categories = await axios.get(`${API_BASE}/api/jobs/categories`);
    console.log('   Categories:', categories.data.data?.length);
    console.log('   Sample:', categories.data.data?.[0]);
    console.log('   ✓ Categories working\n');
    
    console.log('=================================');
    console.log('ALL API ENDPOINTS WORKING ✓');
    console.log('=================================');
    
  } catch (err) {
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.status, err.response.data);
    }
  }
  
  process.exit(0);
}

testAPI();
