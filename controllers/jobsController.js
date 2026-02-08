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
        const { rows } = await pool.query('SELECT * FROM jobs WHERE is_active = TRUE');
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
        const { rows } = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
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
