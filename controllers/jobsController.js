const { query } = require('../config/database');
const logger = require('../utils/logger');

const messages = {
    expired: {
        en: "This job's application date has passed.",
        hi: "इस नौकरी के लिए आवेदन की अंतिम तिथि निकल चुकी है।",
        ta: "இந்த வேலைக்கு விண்ணப்பிக்க கடைசி தேதி கடந்துவிட்டது।"
    }
};

// Get all jobs with filtering, search, and pagination
exports.getJobs = async (req, res) => {
    const lang = req.query.lang || 'en';
    
    try {
        const {
            category,
            type,
            location,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        // Build query dynamically - using existing database schema
        let whereClause = 'WHERE is_active = true AND (last_date IS NULL OR last_date >= CURRENT_DATE)';
        const values = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND category ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        if (type) {
            whereClause += ` AND type = $${paramIndex}`;
            values.push(type);
            paramIndex++;
        }

        if (location) {
            whereClause += ` AND location ILIKE $${paramIndex}`;
            values.push(`%${location}%`);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR COALESCE(company, organization) ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        // Validate sort parameters
        const allowedSortColumns = ['created_at', 'last_date', 'title'];
        const allowedSortOrders = ['asc', 'desc'];
        
        const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM jobs ${whereClause}`;
        const countResult = await query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated results - include is_government and organization
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                id, title, COALESCE(company, organization) as company, organization, category, type, location, 
                criteria as eligibility_criteria, fees_structure, salary,
                last_date, apply_link, source, is_featured, is_active, is_government,
                created_at, updated_at,
                CASE 
                    WHEN last_date < CURRENT_DATE THEN true 
                    ELSE false 
                END as is_expired
            FROM jobs
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
        logger.error('Get jobs error:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch jobs' 
        });
    }
};

// Get single job by ID
exports.getJobById = async (req, res) => {
    const lang = req.query.lang || 'en';
    const { id } = req.params;

    try {
        const query_text = `
            SELECT 
                id, title, COALESCE(company, organization) as company, organization, category, type, location, 
                criteria as eligibility_criteria, fees_structure, salary,
                description, last_date, apply_link, source, is_featured, is_active, is_government,
                created_at, updated_at,
                CASE 
                    WHEN last_date < CURRENT_DATE THEN true 
                    ELSE false 
                END as is_expired
            FROM jobs
            WHERE id = $1
        `;

        const result = await query(query_text, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Job not found' 
            });
        }

        const job = result.rows[0];

        if (job.is_expired) {
            return res.json({ 
                success: true,
                message: messages.expired[lang],
                data: job
            });
        }

        res.json({
            success: true,
            data: job
        });
    } catch (err) {
        logger.error('Get job by ID error:', err);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch job' 
        });
    }
};

// Create new job (company only)
exports.createJob = async (req, res) => {
    try {
        const {
            title,
            company,
            organization,
            description,
            category,
            type,
            location,
            criteria,
            fees_structure,
            salary,
            apply_link,
            source,
            last_date,
            is_featured,
            is_government
        } = req.body;

        const result = await query(
            `INSERT INTO jobs (
                title, company, organization, description, category, type, location,
                criteria, fees_structure, salary, apply_link, source,
                last_date, is_featured, is_active, is_government, posted_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, $15, NOW())
            RETURNING *`,
            [
                title, company, organization, description, category, type, location,
                criteria, fees_structure, salary, apply_link, source,
                last_date, is_featured || false, is_government || false
            ]
        );

        logger.info(`Job created: ${title}`);

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Create job error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create job'
        });
    }
};

// Update job
exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const setClause = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = {
            title: 'title',
            company: 'company',
            organization: 'organization',
            description: 'description',
            category: 'category',
            type: 'type',
            location: 'location',
            criteria: 'criteria',
            fees_structure: 'fees_structure',
            salary: 'salary',
            apply_link: 'apply_link',
            source: 'source',
            last_date: 'last_date',
            is_featured: 'is_featured',
            is_active: 'is_active',
            is_government: 'is_government'
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
            `UPDATE jobs 
             SET ${setClause.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        logger.info(`Job updated: ${id}`);

        res.json({
            success: true,
            message: 'Job updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Update job error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update job'
        });
    }
};

// Delete job
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        logger.info(`Job deleted: ${id}`);

        res.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (err) {
        logger.error('Delete job error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete job'
        });
    }
};

// Get job categories
exports.getCategories = async (req, res) => {
    try {
        const result = await query(`
            SELECT category, COUNT(*) as count
            FROM jobs
            WHERE is_active = true
            AND (last_date IS NULL OR last_date >= CURRENT_DATE)
            GROUP BY category
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        logger.error('Get categories error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
};

// Get featured jobs
exports.getFeaturedJobs = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const result = await query(`
            SELECT 
                id, title, COALESCE(company, organization) as company, organization, category, type, location, 
                criteria as eligibility_criteria, fees_structure, salary,
                last_date, apply_link, source, is_featured, is_government
            FROM jobs
            WHERE is_active = true
            AND is_featured = true
            AND (last_date IS NULL OR last_date >= CURRENT_DATE)
            ORDER BY created_at DESC
            LIMIT $1
        `, [parseInt(limit)]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        logger.error('Get featured jobs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch featured jobs'
        });
    }
};

// Search jobs
exports.searchJobs = async (req, res) => {
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
                id, title, COALESCE(company, organization) as company, organization, category, type, location, 
                criteria as eligibility_criteria, fees_structure, salary,
                last_date, apply_link, source, is_featured, is_government
            FROM jobs
            WHERE is_active = true
            AND (last_date IS NULL OR last_date >= CURRENT_DATE)
            AND (title ILIKE $1 OR description ILIKE $1 OR COALESCE(company, organization) ILIKE $1)
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(searchQuery, [`%${q}%`, parseInt(limit), offset]);

        const countResult = await query(`
            SELECT COUNT(*)
            FROM jobs
            WHERE is_active = true
            AND (last_date IS NULL OR last_date >= CURRENT_DATE)
            AND (title ILIKE $1 OR description ILIKE $1 OR COALESCE(company, organization) ILIKE $1)
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
        logger.error('Search jobs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to search jobs'
        });
    }
};

// Get similar jobs
exports.getSimilarJobs = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 5 } = req.query;

        // Get job details first
        const jobResult = await query(
            'SELECT category, company, organization FROM jobs WHERE id = $1',
            [id]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        const { category, company, organization } = jobResult.rows[0];

        const result = await query(`
            SELECT 
                id, title, COALESCE(company, organization) as company, organization, category, type, location, 
                criteria as eligibility_criteria, fees_structure, salary,
                last_date, apply_link, source, is_featured, is_government
            FROM jobs
            WHERE id != $1
            AND is_active = true
            AND (last_date IS NULL OR last_date >= CURRENT_DATE)
            AND (category = $2 OR COALESCE(company, organization) = $3 OR COALESCE(company, organization) = $4)
            ORDER BY created_at DESC
            LIMIT $5
        `, [id, category, company, organization, parseInt(limit)]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        logger.error('Get similar jobs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch similar jobs'
        });
    }
};

// Get government jobs only
exports.getGovernmentJobs = async (req, res) => {
    try {
        const {
            category,
            location,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        let whereClause = 'WHERE is_active = true AND is_government = true AND (last_date IS NULL OR last_date >= CURRENT_DATE)';
        const values = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND category ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        if (location) {
            whereClause += ` AND location ILIKE $${paramIndex}`;
            values.push(`%${location}%`);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR COALESCE(company, organization) ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        const allowedSortColumns = ['created_at', 'last_date', 'title'];
        const allowedSortOrders = ['asc', 'desc'];
        
        const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

        const countQuery = `SELECT COUNT(*) FROM jobs ${whereClause}`;
        const countResult = await query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                id, title, COALESCE(company, organization) as company, organization, category, type, location, 
                criteria as eligibility_criteria, fees_structure, salary,
                last_date, apply_link, source, is_featured, is_active, is_government,
                created_at, updated_at,
                CASE 
                    WHEN last_date < CURRENT_DATE THEN true 
                    ELSE false 
                END as is_expired
            FROM jobs
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
        logger.error('Get government jobs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch government jobs'
        });
    }
};

// Get private jobs only
exports.getPrivateJobs = async (req, res) => {
    try {
        const {
            category,
            location,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        let whereClause = 'WHERE is_active = true AND (is_government = false OR is_government IS NULL) AND (last_date IS NULL OR last_date >= CURRENT_DATE)';
        const values = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND category ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        if (location) {
            whereClause += ` AND location ILIKE $${paramIndex}`;
            values.push(`%${location}%`);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR COALESCE(company, organization) ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        const allowedSortColumns = ['created_at', 'last_date', 'title'];
        const allowedSortOrders = ['asc', 'desc'];
        
        const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

        const countQuery = `SELECT COUNT(*) FROM jobs ${whereClause}`;
        const countResult = await query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                id, title, COALESCE(company, organization) as company, organization, category, type, location, 
                criteria as eligibility_criteria, fees_structure, salary,
                last_date, apply_link, source, is_featured, is_active, is_government,
                created_at, updated_at,
                CASE 
                    WHEN last_date < CURRENT_DATE THEN true 
                    ELSE false 
                END as is_expired
            FROM jobs
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
        logger.error('Get private jobs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch private jobs'
        });
    }
};
