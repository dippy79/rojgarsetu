const { query } = require('./config/database');

async function check() {
  try {
    // Check if is_government column exists
    const result = await query("SELECT column_name FROM information_schema.columns WHERE table_name='jobs' AND column_name='is_government'");
    if (result.rows.length === 0) {
      console.log('is_government column NOT FOUND - need to run migration');
    } else {
      console.log('is_government column EXISTS');
    }
    
    // Check job count
    const count = await query('SELECT COUNT(*) FROM jobs');
    console.log('Jobs in DB:', count.rows[0].count);
    
    // Check course count
    const courseCount = await query('SELECT COUNT(*) FROM courses');
    console.log('Courses in DB:', courseCount.rows[0].count);
  } catch (e) {
    console.log('Error:', e.message);
  }
  process.exit(0);
}

check();
