const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();
const pool = require('./db');
const jobsRoutes = require('./routes/jobs');
const coursesRoutes = require('./routes/courses');
const { scrapeGovJobs } = require('./crawler/jobCrawler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/jobs', jobsRoutes);
app.use('/courses', coursesRoutes);

app.get('/', (req, res) => res.send('RojgarSetu API is running!'));

// Test DB connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ dbTime: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Daily at 8 AM: run crawler
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily job crawler...');
    await scrapeGovJobs();
    console.log('Job crawler finished.');
});

// Daily at midnight: mark expired jobs
cron.schedule('0 0 * * *', async () => {
    const today = new Date();
    await pool.query(
        'UPDATE jobs SET is_active = FALSE WHERE last_date < $1',
        [today]
    );
    console.log('Expired jobs updated');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
