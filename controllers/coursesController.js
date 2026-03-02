const { query } = require('../config/database');
const logger = require('../utils/logger');

const messages = {
    expired: {
        en: "This course is no longer available.",
        hi: "यह कोर्स अब उपलब्ध नहीं है।",
        ta: "இந்த கோர்ஸ் இனி கிடைக்காது."
    }
};

// Get all courses with filtering, search, and pagination
exports.getCourses = async (req, res) => {
    const lang = req.query.lang || 'en';
    
    try {
        const {
            category,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        // Build query dynamically - using existing database schema
        let whereClause = 'WHERE is_active = true';
        const values = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND category ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        // Validate sort parameters
        const allowedSortColumns = ['created_at', 'title', 'fees'];
        const allowedSortOrders = ['asc', 'desc'];
        
        const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM courses ${whereClause}`;
        const countResult = await query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated results - using simple schema
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                id, title, provider, category, duration, fees, 
                apply_link, description, is_active, created_at, updated_at
            FROM courses
            ${whereClause}
            ORDER BY ${orderBy} ${order}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        values.push(parseInt(limit), offset);

        const result = await query(mainQuery, values);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                hasNextPage: offset + result.rows.length < totalCount,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (err) {
        logger.error('Get courses error:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch courses' 
        });
    }
};

// Get single course by ID
exports.getCourseById = async (req, res) => {
    const lang = req.query.lang || 'en';
    const { id } = req.params;

    try {
        const query_text = `
            SELECT 
                id, title, provider, category, duration, fees, 
                apply_link, description, is_active, created_at, updated_at
            FROM courses
            WHERE id = $1
        `;

        const result = await query(query_text, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Course not found' 
            });
        }

        const course = result.rows[0];

        if (!course.is_active) {
            return res.json({ 
                success: true,
                message: messages.expired[lang],
                data: course
            });
        }

        res.json({
            success: true,
            data: course
        });
    } catch (err) {
        logger.error('Get course by ID error:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch course' 
        });
    }
};

// Create new course
exports.addCourse = async (req, res) => {
    try {
        const {
            title,
            provider,
            description,
            category,
            duration,
            fees,
            apply_link
        } = req.body;

        const result = await query(
            `INSERT INTO courses (
                title, provider, description, category, duration, fees, apply_link, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING *`,
            [title, provider, description, category, duration, fees, apply_link]
        );

        logger.info(`Course created: ${title}`);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Create course error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create course'
        });
    }
};

// Update course
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const setClause = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = {
            title: 'title',
            provider: 'provider',
            description: 'description',
            category: 'category',
            duration: 'duration',
            fees: 'fees',
            apply_link: 'apply_link',
            is_active: 'is_active'
        };

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields[key]) {
                setClause.push(`${allowedFields[key]} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (setClause.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields to update'
            });
        }

        values.push(id);

        const result = await query(
            `UPDATE courses 
             SET ${setClause.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        logger.info(`Course updated: ${id}`);

        res.json({
            success: true,
            message: 'Course updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Update course error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update course'
        });
    }
};

// Delete course
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        logger.info(`Course deleted: ${id}`);

        res.json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (err) {
        logger.error('Delete course error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete course'
        });
    }
};

// Get course categories
exports.getCategories = async (req, res) => {
    try {
        const result = await query(`
            SELECT category, COUNT(*) as count
            FROM courses
            WHERE is_active = true
            GROUP BY category
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        logger.error('Get course categories error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
};

// Get featured courses
exports.getFeaturedCourses = async (req, res) => {
    try {
        // Since there's no is_featured column, return recent courses as featured
        const { limit = 6 } = req.query;

        const result = await query(`
            SELECT 
                id, title, provider, category, duration, fees, 
                apply_link, description
            FROM courses
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT $1
        `, [parseInt(limit)]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        logger.error('Get featured courses error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured courses'
        });
    }
};

// Search courses
exports.searchCourses = async (req, res) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters'
            });
        }

        const searchQuery = `
            SELECT 
                id, title, provider, category, duration, fees, 
                apply_link, description
            FROM courses
            WHERE is_active = true
            AND (title ILIKE $1 OR description ILIKE $1 OR provider ILIKE $1)
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(searchQuery, [`%${q}%`, parseInt(limit), offset]);

        const countResult = await query(`
            SELECT COUNT(*)
            FROM courses
            WHERE is_active = true
            AND (title ILIKE $1 OR description ILIKE $1 OR provider ILIKE $1)
        `, [`%${q}%`]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / parseInt(limit))
            }
        });
    } catch (err) {
        logger.error('Search courses error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to search courses'
        });
    }
};

// Get similar courses
exports.getSimilarCourses = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 5 } = req.query;

        // Get course details first
        const courseResult = await query(
            'SELECT category, provider FROM courses WHERE id = $1',
            [id]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        const { category, provider } = courseResult.rows[0];

        const result = await query(`
            SELECT 
                id, title, provider, category, duration, fees, 
                apply_link, description
            FROM courses
            WHERE id != $1
            AND is_active = true
            AND (category = $2 OR provider = $3)
            ORDER BY created_at DESC
            LIMIT $4
        `, [id, category, provider, parseInt(limit)]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        logger.error('Get similar courses error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch similar courses'
        });
    }
};
