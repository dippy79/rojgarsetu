const pool = require('../db');

const messages = {
    expired: {
        en: "This course is no longer available.",
        hi: "यह कोर्स अब उपलब्ध नहीं है।",
        ta: "இந்த கோர்ஸ் இனி கிடைக்காது."
    }
};

exports.getCourses = async (req, res) => {
    const lang = req.query.lang || 'en';
    const { category, duration, eligibility } = req.query;

    try {
        let query = 'SELECT * FROM courses WHERE is_active = TRUE';
        const values = [];

        if (category) {
            values.push(category);
            query += ` AND category = $${values.length}`;
        }
        if (duration) {
            values.push(duration);
            query += ` AND duration = $${values.length}`;
        }
        if (eligibility) {
            values.push(eligibility);
            query += ` AND eligibility = $${values.length}`;
        }

        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
};

exports.getCourseById = async (req, res) => {
    const lang = req.query.lang || 'en';
    const { id } = req.params;

    try {
        const { rows } = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Course not found' });

        const course = rows[0];
        if (!course.is_active) {
            return res.json({ message: messages.expired[lang] });
        }

        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

exports.addCourse = async (req, res) => {
    try {
        const { name, category, duration, fees_structure, eligibility, apply_link } = req.body;
        const result = await pool.query(
            `INSERT INTO courses (name, category, duration, fees_structure, eligibility, apply_link, is_active)
             VALUES ($1,$2,$3,$4,$5,$6, TRUE) RETURNING *`,
            [name, category, duration, fees_structure, eligibility, apply_link]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add course' });
    }
};
