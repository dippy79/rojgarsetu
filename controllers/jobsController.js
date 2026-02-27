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
            salaryMin,
            salaryMax,
            search,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = req.query;

        // Build query dynamically
        let whereClause = 'WHERE j.is_active = true AND (j.last_date IS NULL OR j.last_date >= CURRENT_DATE)';
        const values = [];
        let paramIndex = 1;

        if (category) {
            whereClause += ` AND j.category ILIKE $${paramIndex}`;
            values.push(`%${category}%`);
            paramIndex++;
        }

        if (type) {
            whereClause += ` AND j.type = $${paramIndex}`;
            values.push(type);
            paramIndex++;
        }

        if (location) {
            whereClause += ` AND j.location ILIKE $${paramIndex}`;
            values.push(`%${location}%`);
            paramIndex++;
        }

        if (salaryMin) {
            whereClause += ` AND j.salary_max >= $${paramIndex}`;
            values.push(parseInt(salaryMin));
            paramIndex++;
        }

        if (salaryMax) {
            whereClause += ` AND j.salary_min <= $${paramIndex}`;
            values.push(parseInt(salaryMax));
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex} OR j.skills_required && ARRAY[$${paramIndex}])`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        // Validate sort parameters
        const allowedSortColumns = ['created_at', 'last_date', 'salary_min', 'salary_max', 'views', 'title'];
        const allowedSortOrders = ['asc', 'desc'];
        
        const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const order = allowedSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM jobs j ${whereClause}`;
        const countResult = await query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated results
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                j.*,
                c.company_name,
                c.company_slug,
                c.logo_url as company_logo,
                CASE 
                    WHEN j.last_date < CURRENT_DATE THEN true 
                    ELSE false 
                END as is_expired
            FROM jobs j
            LEFT JOIN company_profiles c ON j.company_id = c.id
            ${whereClause}
            ORDER BY j.${orderBy} ${order}
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

// Get single job by ID or slug
exports.getJobById = async (req, res) => {
    const lang = req.query.lang || 'en';
    const { id } = req.params;

    try {
        // Try UUID first, then slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        const query_text = `
            SELECT 
                j.*,
                c.company_name,
                c.company_slug,
                c.description as company_description,
                c.website as company_website,
                c.logo_url as company_logo,
                c.location as company_location,
                c.verified as company_verified,
                CASE 
                    WHEN j.last_date < CURRENT_DATE THEN true 
                    ELSE false 
                END as is_expired
            FROM jobs j
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE j.${isUUID ? 'id' : 'slug'} = $1
        `;

        const result = await query(query_text, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Job not found' 
            });
        }

        const job = result.rows[0];

        // Check if job is expired
        if (job.is_expired) {
            return res.json({ 
                success: true,
                message: messages.expired[lang],
                data: job
            });
        }

        // Increment view count (async, don't wait)
        query('UPDATE jobs SET views = views + 1 WHERE id = $1', [job.id])
            .catch(err => logger.error('Failed to increment view count:', err));

        // Log view if user is authenticated
        if (req.user) {
            query(
                'INSERT INTO job_views (job_id, viewer_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [job.id, req.user.id]
            ).catch(err => logger.error('Failed to log job view:', err));
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
        const companyId = req.companyId;
        const {
            title,
            description,
            category,
            type,
            location,
            salaryMin,
            salaryMax,
            experienceRequired,
            educationRequired,
            skillsRequired,
            eligibilityCriteria,
            feesStructure,
            benefits,
            applyLink,
            applicationProcess,
            lastDate,
            vacancies
        } = req.body;

        // Generate slug
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now();

        const result = await query(
            `INSERT INTO jobs (
                company_id, title, slug, description, category, type, location,
                salary_min, salary_max, experience_required, education_required,
                skills_required, eligibility_criteria, fees_structure, benefits,
                apply_link, application_process, last_date, vacancies, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, true)
            RETURNING *`,
            [
                companyId, title, slug, description, category, type, location,
                salaryMin, salaryMax, experienceRequired, educationRequired,
                skillsRequired || [], eligibilityCriteria, feesStructure, benefits,
                applyLink, applicationProcess, lastDate, vacancies || 1
            ]
        );

        logger.info(`Job created: ${title} by company ${companyId}`);

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

// Update job (company owner or admin)
exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.companyId;
        const isAdmin = req.user.role === 'admin';

        // Check if job exists and belongs to company (unless admin)
        let checkQuery = 'SELECT company_id FROM jobs WHERE id = $1';
        const checkResult = await query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (!isAdmin && checkResult.rows[0].company_id !== companyId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this job'
            });
        }

        const updates = req.body;
        const allowedFields = [
            'title', 'description', 'category', 'type', 'location',
            'salaryMin', 'salaryMax', 'experienceRequired', 'educationRequired',
            'skillsRequired', 'eligibilityCriteria', 'feesStructure', 'benefits',
            'applyLink', 'applicationProcess', 'lastDate', 'vacancies', 'isActive', 'isFeatured'
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
            `UPDATE jobs 
             SET ${setClause.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        logger.info(`Job updated: ${id} by ${req.user.email}`);

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

// Delete job (company owner or admin)
exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.companyId;
        const isAdmin = req.user.role === 'admin';

        // Check ownership
        const checkResult = await query(
            'SELECT company_id FROM jobs WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (!isAdmin && checkResult.rows[0].company_id !== companyId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to delete this job'
            });
        }

        await query('DELETE FROM jobs WHERE id = $1', [id]);

        logger.info(`Job deleted: ${id} by ${req.user.email}`);

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
                j.*,
                c.company_name,
                c.company_slug,
                c.logo_url as company_logo
            FROM jobs j
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE j.is_active = true
            AND j.is_featured = true
            AND (j.last_date IS NULL OR j.last_date >= CURRENT_DATE)
            ORDER BY j.created_at DESC
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

// Search jobs with full-text search
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
                j.*,
                c.company_name,
                c.company_slug,
                c.logo_url as company_logo,
                ts_rank(to_tsvector('english', j.title || ' ' || COALESCE(j.description, '')), 
                        plainto_tsquery('english', $1)) as relevance
            FROM jobs j
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE j.is_active = true
            AND (j.last_date IS NULL OR j.last_date >= CURRENT_DATE)
            AND to_tsvector('english', j.title || ' ' || COALESCE(j.description, '')) @@ plainto_tsquery('english', $1)
            ORDER BY relevance DESC, j.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(searchQuery, [q, parseInt(limit), offset]);

        // Get total count
        const countResult = await query(`
            SELECT COUNT(*)
            FROM jobs j
            WHERE j.is_active = true
            AND (j.last_date IS NULL OR j.last_date >= CURRENT_DATE)
            AND to_tsvector('english', j.title || ' ' || COALESCE(j.description, '')) @@ plainto_tsquery('english', $1)
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
            'SELECT category, skills_required FROM jobs WHERE id = $1',
            [id]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        const { category, skills_required } = jobResult.rows[0];

        const result = await query(`
            SELECT 
                j.*,
                c.company_name,
                c.company_slug,
                c.logo_url as company_logo
            FROM jobs j
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE j.id != $1
            AND j.is_active = true
            AND (j.last_date IS NULL OR j.last_date >= CURRENT_DATE)
            AND (j.category = $2 OR j.skills_required && $3)
            ORDER BY 
                CASE WHEN j.category = $2 THEN 1 ELSE 0 END DESC,
                j.created_at DESC
            LIMIT $4
        `, [id, category, skills_required || [], parseInt(limit)]);

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

// Save a job (candidate)
exports.saveJob = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const userId = req.user.id;

        // Get candidate profile
        const candidateResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const candidateId = candidateResult.rows[0].id;

        // Check if job exists
        const jobResult = await query(
            'SELECT id, title FROM jobs WHERE id = $1',
            [jobId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        // Check if already saved
        const existingSave = await query(
            'SELECT id FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2',
            [candidateId, jobId]
        );

        if (existingSave.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Job already saved'
            });
        }

        // Save the job
        await query(
            'INSERT INTO saved_jobs (candidate_id, job_id) VALUES ($1, $2)',
            [candidateId, jobId]
        );

        logger.info(`Job ${jobId} saved by candidate ${candidateId}`);

        res.json({
            success: true,
            message: 'Job saved successfully'
        });
    } catch (err) {
        logger.error('Save job error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to save job'
        });
    }
};

// Unsave a job (candidate)
exports.unsaveJob = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const userId = req.user.id;

        // Get candidate profile
        const candidateResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const candidateId = candidateResult.rows[0].id;

        // Remove from saved jobs
        const result = await query(
            'DELETE FROM saved_jobs WHERE candidate_id = $1 AND job_id = $2 RETURNING id',
            [candidateId, jobId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Saved job not found'
            });
        }

        logger.info(`Job ${jobId} unsaved by candidate ${candidateId}`);

        res.json({
            success: true,
            message: 'Job removed from saved list'
        });
    } catch (err) {
        logger.error('Unsave job error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to unsave job'
        });
    }
};

// Get saved jobs (candidate)
exports.getSavedJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        // Get candidate profile
        const candidateResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const candidateId = candidateResult.rows[0].id;

        // Get total count
        const countResult = await query(
            'SELECT COUNT(*) FROM saved_jobs WHERE candidate_id = $1',
            [candidateId]
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated saved jobs
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(`
            SELECT 
                j.*,
                c.company_name,
                c.company_slug,
                c.logo_url as company_logo,
                sj.saved_at
            FROM saved_jobs sj
            JOIN jobs j ON sj.job_id = j.id
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE sj.candidate_id = $1
            ORDER BY sj.saved_at DESC
            LIMIT $2 OFFSET $3
        `, [candidateId, parseInt(limit), offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (err) {
        logger.error('Get saved jobs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch saved jobs'
        });
    }
};

// Apply to job (candidate)
exports.applyToJob = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const userId = req.user.id;
        const { coverLetter, resumeUrl } = req.body;

        // Get candidate profile
        const candidateResult = await query(
            'SELECT id, resume_url FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const candidateId = candidateResult.rows[0].id;
        const candidateResumeUrl = candidateResult.rows[0].resume_url;

        // Check if job exists and is active
        const jobResult = await query(
            `SELECT id, title, company_id, last_date, is_active 
             FROM jobs WHERE id = $1`,
            [jobId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        const job = jobResult.rows[0];

        if (!job.is_active) {
            return res.status(400).json({
                success: false,
                error: 'This job is no longer accepting applications'
            });
        }

        if (job.last_date && new Date(job.last_date) < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'The application deadline for this job has passed'
            });
        }

        // Check if already applied
        const existingApp = await query(
            'SELECT id FROM job_applications WHERE candidate_id = $1 AND job_id = $2',
            [candidateId, jobId]
        );

        if (existingApp.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'You have already applied to this job'
            });
        }

        // Create application
        const result = await query(`
            INSERT INTO job_applications (job_id, candidate_id, cover_letter, resume_url, status)
            VALUES ($1, $2, $3, $4, 'applied')
            RETURNING *
        `, [jobId, candidateId, coverLetter, resumeUrl || candidateResumeUrl]);

        // Update job applications count
        await query(
            'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1',
            [jobId]
        );

        // Create notification for company
        await query(`
            INSERT INTO notifications (user_id, type, title, message, data)
            SELECT cp.user_id, 'new_application', 'New Job Application', 
                   $1::text, $2::jsonb
            FROM company_profiles cp
            WHERE cp.id = $3
        `, [`New application for ${job.title}`, JSON.stringify({ jobId, applicationId: result.rows[0].id }), job.company_id]);

        logger.info(`Application created for job ${jobId} by candidate ${candidateId}`);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Apply to job error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to apply to job'
        });
    }
};

// Withdraw application (candidate)
exports.withdrawApplication = async (req, res) => {
    try {
        const { id: jobId } = req.params;
        const userId = req.user.id;

        // Get candidate profile
        const candidateResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const candidateId = candidateResult.rows[0].id;

        // Check if application exists
        const existingApp = await query(
            'SELECT id, status FROM job_applications WHERE candidate_id = $1 AND job_id = $2',
            [candidateId, jobId]
        );

        if (existingApp.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        if (existingApp.rows[0].status === 'hired' || existingApp.rows[0].status === 'withdrawn') {
            return res.status(400).json({
                success: false,
                error: 'Cannot withdraw this application'
            });
        }

        // Update status to withdrawn
        await query(
            `UPDATE job_applications SET status = 'withdrawn', updated_at = NOW() 
             WHERE candidate_id = $1 AND job_id = $2`,
            [candidateId, jobId]
        );

        // Update job applications count
        await query(
            'UPDATE jobs SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = $1',
            [jobId]
        );

        logger.info(`Application withdrawn for job ${jobId} by candidate ${candidateId}`);

        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });
    } catch (err) {
        logger.error('Withdraw application error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to withdraw application'
        });
    }
};

// Get my applications (candidate)
exports.getMyApplications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, status } = req.query;

        // Get candidate profile
        const candidateResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const candidateId = candidateResult.rows[0].id;

        let whereClause = 'WHERE ja.candidate_id = $1';
        const values = [candidateId];
        let paramIndex = 2;

        if (status) {
            whereClause += ` AND ja.status = $${paramIndex}`;
            values.push(status);
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM job_applications ja ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated applications
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(`
            SELECT 
                ja.id, ja.status, ja.applied_at, ja.updated_at, ja.cover_letter, ja.notes,
                j.id as job_id, j.title, j.location, j.type, j.salary_min, j.salary_max,
                c.company_name, c.company_slug, c.logo_url as company_logo
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            LEFT JOIN company_profiles c ON j.company_id = c.id
            ${whereClause}
            ORDER BY ja.applied_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...values, parseInt(limit), offset]);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (err) {
        logger.error('Get my applications error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications'
        });
    }
};

// Get application details (candidate)
exports.getMyApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Get candidate profile
        const candidateResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (candidateResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const candidateId = candidateResult.rows[0].id;

        const result = await query(`
            SELECT 
                ja.id, ja.status, ja.applied_at, ja.updated_at, ja.cover_letter, ja.notes, ja.resume_url,
                j.id as job_id, j.title, j.description, j.location, j.type, j.salary_min, j.salary_max,
                j.category, j.skills_required, j.benefits,
                c.company_name, c.company_slug, c.logo_url as company_logo, 
                c.description as company_description, c.website as company_website
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE ja.id = $1 AND ja.candidate_id = $2
        `, [id, candidateId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Get my application error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application'
        });
    }
};
