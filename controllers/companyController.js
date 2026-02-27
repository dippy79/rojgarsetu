// controllers/companyController.js - Company management controller
const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');

// Get company jobs with applicant counts
exports.getCompanyJobs = async (req, res) => {
    try {
        const companyId = req.companyId;
        const { page = 1, limit = 20, status, search } = req.query;

        let whereClause = 'WHERE j.company_id = $1';
        const values = [companyId];
        let paramIndex = 2;

        if (status === 'active') {
            whereClause += ' AND j.is_active = true';
        } else if (status === 'inactive') {
            whereClause += ' AND j.is_active = false';
        }

        if (search) {
            whereClause += ` AND j.title ILIKE $${paramIndex}`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM jobs j ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated results
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(`
            SELECT 
                j.*,
                (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applications_count,
                (SELECT COUNT(*) FROM job_views WHERE job_id = j.id) as views_count
            FROM jobs j
            ${whereClause}
            ORDER BY j.created_at DESC
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
    } catch (error) {
        logger.error('Get company jobs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company jobs'
        });
    }
};

// Get applicants for a specific job
exports.getJobApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const companyId = req.companyId;
        const { status, search, page = 1, limit = 20 } = req.query;

        // Verify job belongs to company
        const jobResult = await query(
            'SELECT id, title, company_id FROM jobs WHERE id = $1',
            [jobId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (jobResult.rows[0].company_id !== companyId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to view applicants for this job'
            });
        }

        let whereClause = 'WHERE ja.job_id = $1';
        const values = [jobId];
        let paramIndex = 2;

        if (status) {
            whereClause += ` AND ja.status = $${paramIndex}`;
            values.push(status);
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (cp.first_name ILIKE $${paramIndex} OR cp.last_name ILIKE $${paramIndex} OR cp.email ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM job_applications ja 
             JOIN candidate_profiles cp ON ja.candidate_id = cp.id 
             ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get paginated applicants
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(`
            SELECT 
                ja.id, ja.status, ja.applied_at, ja.updated_at, ja.cover_letter, ja.notes,
                ja.resume_url,
                cp.id as candidate_id,
                cp.first_name, cp.last_name, cp.email,
                cp.phone, cp.location, cp.education, cp.experience,
                cp.skills, cp.resume_url as candidate_resume,
                cp.expected_salary_min, cp.expected_salary_max
            FROM job_applications ja
            JOIN candidate_profiles cp ON ja.candidate_id = cp.id
            ${whereClause}
            ORDER BY ja.applied_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...values, parseInt(limit), offset]);

        res.json({
            success: true,
            data: {
                job: jobResult.rows[0],
                applicants: result.rows
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (error) {
        logger.error('Get job applicants error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applicants'
        });
    }
};

// Update applicant status
exports.updateApplicantStatus = async (req, res) => {
    try {
        const { jobId, applicationId } = req.params;
        const companyId = req.companyId;
        const { status, notes } = req.body;

        // Verify job belongs to company
        const jobResult = await query(
            'SELECT id, title, company_id FROM jobs WHERE id = $1',
            [jobId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (jobResult.rows[0].company_id !== companyId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update this application'
            });
        }

        // Validate status
        const validStatuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        // Update application status
        const result = await query(`
            UPDATE job_applications 
            SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
            WHERE id = $3 AND job_id = $4
            RETURNING *
        `, [status, notes, applicationId, jobId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        // Create notification for candidate
        const candidateId = result.rows[0].candidate_id;
        const statusMessages = {
            screening: 'Your application has been shortlisted for screening',
            interview: 'Congratulations! You have been shortlisted for an interview',
            offer: 'Congratulations! You have received a job offer',
            hired: 'Congratulations! You have been hired',
            rejected: 'We regret to inform you that your application was not selected'
        };

        if (statusMessages[status]) {
            await query(`
                INSERT INTO notifications (user_id, type, title, message, data)
                SELECT cp.user_id, 'application_update', 'Application Status Update', $1, $2::jsonb
                FROM candidate_profiles cp
                WHERE cp.id = $3
            `, [statusMessages[status], JSON.stringify({ jobId, applicationId }), candidateId]);
        }

        logger.info(`Application ${applicationId} status updated to ${status} by company ${companyId}`);

        res.json({
            success: true,
            message: 'Application status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        logger.error('Update applicant status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update application status'
        });
    }
};

// Get company analytics
exports.getCompanyAnalytics = async (req, res) => {
    try {
        const companyId = req.companyId;
        const { period = '30' } = req.query; // days

        // Overview stats
        const overviewResult = await query(`
            SELECT 
                COUNT(*) as total_jobs,
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_jobs,
                SUM(views) as total_views,
                SUM(applications_count) as total_applications,
                AVG(views) as avg_views,
                AVG(applications_count) as avg_applications
            FROM jobs
            WHERE company_id = $1
        `, [companyId]);

        // Applications over time
        const applicationsOverTime = await query(`
            SELECT 
                DATE(ja.applied_at) as date,
                COUNT(*) as count
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            WHERE j.company_id = $1
            AND ja.applied_at >= NOW() - INTERVAL '${parseInt(period)} days'
            GROUP BY DATE(ja.applied_at)
            ORDER BY date ASC
        `, [companyId]);

        // Views over time
        const viewsOverTime = await query(`
            SELECT 
                DATE(viewed_at) as date,
                COUNT(*) as count
            FROM job_views jv
            JOIN jobs j ON jv.job_id = j.id
            WHERE j.company_id = $1
            AND jv.viewed_at >= NOW() - INTERVAL '${parseInt(period)} days'
            GROUP BY DATE(viewed_at)
            ORDER BY date ASC
        `, [companyId]);

        // Top skills from applicants
        const topSkillsResult = await query(`
            SELECT skill, COUNT(*) as count
            FROM (
                SELECT jsonb_array_elements_text(cp.skills) as skill
                FROM job_applications ja
                JOIN candidate_profiles cp ON ja.candidate_id = cp.id
                JOIN jobs j ON ja.job_id = j.id
                WHERE j.company_id = $1
            ) skills
            GROUP BY skill
            ORDER BY count DESC
            LIMIT 10
        `, [companyId]);

        // Status distribution
        const statusDistribution = await query(`
            SELECT 
                ja.status,
                COUNT(*) as count
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            WHERE j.company_id = $1
            GROUP BY ja.status
        `, [companyId]);

        // Jobs performance
        const jobsPerformance = await query(`
            SELECT 
                id, title, views, applications_count,
                CASE 
                    WHEN applications_count > 0 THEN ROUND((views::float / applications_count), 2)
                    ELSE 0
                END as view_to_application_ratio
            FROM jobs
            WHERE company_id = $1
            ORDER BY applications_count DESC
            LIMIT 10
        `, [companyId]);

        res.json({
            success: true,
            data: {
                overview: overviewResult.rows[0],
                applicationsOverTime: applicationsOverTime.rows,
                viewsOverTime: viewsOverTime.rows,
                topSkills: topSkillsResult.rows,
                statusDistribution: statusDistribution.rows,
                jobsPerformance: jobsPerformance.rows
            }
        });
    } catch (error) {
        logger.error('Get company analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
};

// Bulk update applicant status
exports.bulkUpdateApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const companyId = req.companyId;
        const { applicationIds, status } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Application IDs are required'
            });
        }

        // Verify job belongs to company
        const jobResult = await query(
            'SELECT id, company_id FROM jobs WHERE id = $1',
            [jobId]
        );

        if (jobResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (jobResult.rows[0].company_id !== companyId) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to update these applications'
            });
        }

        // Validate status
        const validStatuses = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        // Update multiple applications
        const result = await query(`
            UPDATE job_applications 
            SET status = $1, updated_at = NOW()
            WHERE id = ANY($2) AND job_id = $3
            RETURNING id
        `, [status, applicationIds, jobId]);

        logger.info(`Bulk updated ${result.rowCount} applications to status ${status}`);

        res.json({
            success: true,
            message: `Updated ${result.rowCount} applications`,
            data: {
                updatedCount: result.rowCount
            }
        });
    } catch (error) {
        logger.error('Bulk update applicants error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update applications'
        });
    }
};
