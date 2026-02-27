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
            duration,
            mode,
            feesMin,
            feesMax,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        // Build query dynamically
        let whereClause = 'WHERE c.is_active = true';
        const values = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND c.category ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        if (duration) {
            whereClause += ` AND c.duration ILIKE $${paramIndex}`;
            values.push(`%${duration}%`);
            paramIndex++;
        }

        if (mode) {
            whereClause += ` AND c.mode = $${paramIndex}`;
            values.push(mode);
            paramIndex++;
        }

        if (feesMin) {
            whereClause += ` AND c.fees_amount >= $${paramIndex}`;
            values.push(parseInt(feesMin));
            paramIndex++;
        }

        if (feesMax) {
            whereClause += ` AND c.fees_amount <= $${paramIndex}`;
            values.push(parseInt(feesMax));
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        // Validate sort parameters
        const allowedSortColumns = ['created_at', 'fees_amount', 'rating', 'name', 'enrolled_count'];
        const allowedSortOrders = ['asc', 'desc'];
        
        const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM courses c ${whereClause}`;
        const countResult = await query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated results
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                c.*,
                p.company_name as provider_name,
                p.company_slug as provider_slug,
                p.logo_url as provider_logo
            FROM courses c
            LEFT JOIN company_profiles p ON c.provider_id = p.id
            ${whereClause}
            ORDER BY c.${orderBy} ${order}
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

// Get single course by ID or slug
exports.getCourseById = async (req, res) => {
    const lang = req.query.lang || 'en';
    const { id } = req.params;

    try {
        // Try UUID first, then slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        const query_text = `
            SELECT 
                c.*,
                p.company_name as provider_name,
                p.company_slug as provider_slug,
                p.description as provider_description,
                p.website as provider_website,
                p.logo_url as provider_logo,
                p.location as provider_location,
                p.verified as provider_verified
            FROM courses c
            LEFT JOIN company_profiles p ON c.provider_id = p.id
            WHERE c.${isUUID ? 'id' : 'slug'} = $1
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

        // Increment view count (async, don't wait)
        query('UPDATE courses SET views = views + 1 WHERE id = $1', [course.id])
            .catch(err => logger.error('Failed to increment course view count:', err));

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

// Create new course (company/admin only)
exports.addCourse = async (req, res) => {
    try {
        const providerId = req.companyId || req.body.providerId;
        const {
            name,
            description,
            category,
            subcategory,
            duration,
            durationWeeks,
            mode,
            feesStructure,
            feesAmount,
            eligibility,
            syllabus,
            certification,
            applyLink,
            startDate,
            batchSize
        } = req.body;

        // Generate slug
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();

        const result = await query(
            `INSERT INTO courses (
                provider_id, name, slug, description, category, subcategory,
                duration, duration_weeks, mode, fees_structure, fees_amount,
                eligibility, syllabus, certification, apply_link, start_date, batch_size, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true)
            RETURNING *`,
            [
                providerId, name, slug, description, category, subcategory,
                duration, durationWeeks, mode, feesStructure, feesAmount,
                eligibility, syllabus, certification, applyLink, startDate, batchSize
            ]
        );

        logger.info(`Course created: ${name} by provider ${providerId}`);

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

// Update course (provider or admin)
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.companyId;
        const isAdmin = req.user.role === 'admin';

        // Check if course exists and belongs to provider (unless admin)
        const checkResult = await query(
            'SELECT provider_id FROM courses WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        if (!isAdmin && checkResult.rows[0].provider_id !== providerId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this course'
            });
        }

        const updates = req.body;
        const allowedFields = [
            'name', 'description', 'category', 'subcategory', 'duration',
            'durationWeeks', 'mode', 'feesStructure', 'feesAmount',
            'eligibility', 'syllabus', 'certification', 'applyLink',
            'startDate', 'batchSize', 'isActive', 'isFeatured'
        ];

        const setClause = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            if (allowedFields.includes(key)) {
                setClause.push(`${dbField} = $${paramIndex}`);
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

        logger.info(`Course updated: ${id} by ${req.user.email}`);

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

// Delete course (provider or admin)
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const providerId = req.companyId;
        const isAdmin = req.user.role === 'admin';

        // Check ownership
        const checkResult = await query(
            'SELECT provider_id FROM courses WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        if (!isAdmin && checkResult.rows[0].provider_id !== providerId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this course'
            });
        }

        await query('DELETE FROM courses WHERE id = $1', [id]);

        logger.info(`Course deleted: ${id} by ${req.user.email}`);

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
        const { limit = 6 } = req.query;

        const result = await query(`
            SELECT 
                c.*,
                p.company_name as provider_name,
                p.company_slug as provider_slug,
                p.logo_url as provider_logo
            FROM courses c
            LEFT JOIN company_profiles p ON c.provider_id = p.id
            WHERE c.is_active = true
            AND c.is_featured = true
            ORDER BY c.created_at DESC
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

// Search courses with full-text search
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
                c.*,
                p.company_name as provider_name,
                p.company_slug as provider_slug,
                p.logo_url as provider_logo,
                ts_rank(to_tsvector('english', c.name || ' ' || COALESCE(c.description, '')), 
                        plainto_tsquery('english', $1)) as relevance
            FROM courses c
            LEFT JOIN company_profiles p ON c.provider_id = p.id
            WHERE c.is_active = true
            AND to_tsvector('english', c.name || ' ' || COALESCE(c.description, '')) @@ plainto_tsquery('english', $1)
            ORDER BY relevance DESC, c.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(searchQuery, [q, parseInt(limit), offset]);

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*)
            FROM courses c
            WHERE c.is_active = true
            AND to_tsvector('english', c.name || ' ' || COALESCE(c.description, '')) @@ plainto_tsquery('english', $1)
        `, [q]);

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
            'SELECT category, subcategory FROM courses WHERE id = $1',
            [id]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        const { category, subcategory } = courseResult.rows[0];

        const result = await query(`
            SELECT 
                c.*,
                p.company_name as provider_name,
                p.company_slug as provider_slug,
                p.logo_url as provider_logo
            FROM courses c
            LEFT JOIN company_profiles p ON c.provider_id = p.id
            WHERE c.id != $1
            AND c.is_active = true
            AND (c.category = $2 OR c.subcategory = $3)
            ORDER BY 
                CASE WHEN c.category = $2 THEN 1 ELSE 0 END DESC,
                c.rating DESC,
                c.created_at DESC
            LIMIT $4
        `, [id, category, subcategory, parseInt(limit)]);

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
