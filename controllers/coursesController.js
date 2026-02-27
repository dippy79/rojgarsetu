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
        let query = 'SELECT * FROM courses WHERE is_active = 1';
        const values = [];

        if (category) {
            values.push(category);
            query += ` AND category = ?`;
        }
        if (duration) {
            values.push(duration);
            query += ` AND duration = ?`;
        }
        if (eligibility) {
            values.push(eligibility);
            query += ` AND eligibility = ?`;
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
        const { rows } = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
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
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [name, category, duration, fees_structure, eligibility, apply_link]
        );
        res.json({ 
            id: result.rows[0].id,
            name, 
            category, 
            duration, 
            fees_structure, 
            eligibility, 
            apply_link,
            is_active: 1
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add course' });
    }
};

// New: Update course
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, duration, fees_structure, eligibility, apply_link, is_active } = req.body;
        
        const result = await pool.query(
            `UPDATE courses 
             SET name = ?, category = ?, duration = ?, fees_structure = ?, eligibility = ?, apply_link = ?, is_active = ?
             WHERE id = ?`,
            [name, category, duration, fees_structure, eligibility, apply_link, is_active ? 1 : 0, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        res.json({ success: true, message: 'Course updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update course' });
    }
};

// New: Delete course
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete course' });
    }
};
