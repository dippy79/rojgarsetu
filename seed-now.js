const { seedIfEmpty, getStats, fetchAllJobsAndCourses } = require('./services/jobFetcher');

async function seed() {
  console.log('Running seed now...');
  
  try {
    const result = await fetchAllJobsAndCourses();
    console.log('\n=== Seed Results ===');
    console.log('Success:', result.success);
    console.log('Government Jobs inserted:', result.governmentJobs.inserted);
    console.log('Private Jobs inserted:', result.privateJobs.inserted);
    console.log('Courses inserted:', result.courses.inserted);
    
    const stats = await getStats();
    console.log('\n=== Current Stats ===');
    console.log('Total Jobs:', stats.totalJobs);
    console.log('Government Jobs:', stats.governmentJobs);
    console.log('Private Jobs:', stats.privateJobs);
    console.log('Total Courses:', stats.totalCourses);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

seed();
