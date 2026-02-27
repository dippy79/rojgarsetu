const pool = require('../db');

const messages = {
    expired: {
        en: "This job's application date has passed.",
        hi: "इस नौकरी के लिए आवेदन की अंतिम तिथि निकल चुकी है।",
        ta: "இந்த வேலைக்கு விண்ணப்பிக்க கடைசி தேதி கடந்துவிட்டது।"
    }
};

exports.getJobs = async (req, res) => {
    const lang = req.query.lang || 'en';

    try {
        const { rows } = await pool.query('SELECT * FROM jobs WHERE is_active = 1');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

exports.getJobById = async (req, res) => {
    const lang = req.query.lang || 'en';
    const { id } = req.params;

    try {
        const { rows } = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Job not found' });

        const job = rows[0];
        if (!job.is_active) {
            return res.json({ message: messages.expired[lang] });
        }

        res.json(job);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch job' });
    }
};

// New: Create job
exports.createJob = async (req, res) => {
    try {
        const { title, category, type, apply_link, criteria, fees_structure, last_date } = req.body;
        const result = await pool.query(
            `INSERT INTO jobs (title, category, type, apply_link, criteria, fees_structure, last_date, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [title, category, type, apply_link, criteria, fees_structure, last_date]
        );
        res.json({ 
            id: result.rows[0].id,
            title, 
            category, 
            type, 
            apply_link, 
            criteria, 
            fees_structure, 
            last_date,
            is_active: 1
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create job' });
    }
};

// New: Update job
exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, type, apply_link, criteria, fees_structure, last_date, is_active } = req.body;
        
        const result = await pool.query(
            `UPDATE jobs 
             SET title = ?, category = ?, type = ?, apply_link = ?, criteria = ?, fees_structure = ?, last_date = ?, is_active = ?
             WHERE id = ?`,
            [title, category, type, apply_link, criteria, fees_structure, last_date, is_active ? 1 : 0, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        res.json({ success: true, message: 'Job updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update job' });
    }
};

// New: Delete job
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete job' });
    }
};
