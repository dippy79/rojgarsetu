const { query } = require('./config/database');

async function check() {
  try {
    // Check columns in courses table
    const cols = await query("SELECT column_name FROM information_schema.columns WHERE table_name='courses' ORDER BY ordinal_position");
    console.log('Courses table columns:', cols.rows.map(r => r.column_name).join(', '));
    
    // Check sample data
    const sample = await query('SELECT * FROM courses LIMIT 2');
    console.log('\nSample course data:');
    console.log(JSON.stringify(sample.rows, null, 2));
    
  } catch (e) {
    console.log('Error:', e.message);
  }
  process.exit(0);
}

check();
