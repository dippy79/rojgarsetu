// controllers/applicationsController.js - Application Tracking Controller
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Helper to get candidate profile ID from user ID
const getCandidateId = async (userId) => {
    const { rows } = await query(
        'SELECT id FROM candidate_profiles WHERE user_id = $1',
        [userId]
    );
    return rows[0]?.id;
};

// Helper to get company profile ID from user ID
const getCompanyId = async (userId) => {
    const { rows } = await query(
        'SELECT id FROM company_profiles WHERE user_id = $1',
        [userId]
    );
    return rows[0]?.id;
};

// Get all applications (for candidates - their own applications)
exports.getMyApplications = async (req, res) => {
    try {
        const candidateId = await getCandidateId(req.user.id);
        
        if (!candidateId) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const {
            status,
            page = 1,
            limit = 20
        } = req.query;

        let whereClause = 'WHERE ja.candidate_id = $1';
        const values = [candidateId];
        let paramIndex = 2;

        if (status) {
            whereClause += ` AND ja.status = $${paramIndex}`;
            values.push(status);
            paramIndex++;
        }

        // Get total count
        const countQuery = `
            SELECT COUNT(*) 
            FROM job_applications ja
            ${whereClause}
        `;
        const countResult = await query(countQuery, values);
        const totalCount = parseInt(countResult.rows[0].count);

        // Get applications with job details
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                ja.id, ja.status, ja.cover_letter, ja.applied_at, ja.updated_at,
                ja.screening_score, ja.interview_date, ja.interview_mode, ja.offer_salary,
                j.id as job_id, j.title as job_title, j.location as job_location,
                j.type as job_type, j.salary_min, j.salary_max,
                c.company_name, c.logo_url
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            JOIN company_profiles c ON j.company_id = c.id
            ${whereClause}
            ORDER BY ja.applied_at DESC
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

// Get single application by ID (candidate)
exports.getMyApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const candidateId = await getCandidateId(req.user.id);

        const { rows } = await query(
            `SELECT ja.*, j.title as job_title, j.location as job_location, 
                    j.type as job_type, c.company_name
             FROM job_applications ja
             JOIN jobs j ON ja.job_id = j.id
             JOIN company_profiles c ON j.company_id = c.id
             WHERE ja.id = $1 AND ja.candidate_id = $2`,
            [id, candidateId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (err) {
        logger.error('Get my application error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application'
        });
    }
};

// Apply to a job (candidate)
exports.applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { cover_letter, resume_id } = req.body;
        const candidateId = await getCandidateId(req.user.id);

        if (!candidateId) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        // Check if job exists and is active
        const jobCheck = await query(
            'SELECT id, title, is_active, last_date FROM jobs WHERE id = $1',
            [jobId]
        );

        if (jobCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

        if (!jobCheck.rows[0].is_active) {
            return res.status(400).json({
                success: false,
                error: 'This job is no longer accepting applications'
            });
        }

        // Check if already applied
        const existingApp = await query(
            'SELECT id FROM job_applications WHERE job_id = $1 AND candidate_id = $2',
            [jobId, candidateId]
        );

        if (existingApp.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'You have already applied to this job'
            });
        }

        // Create application
        const result = await query(
            `INSERT INTO job_applications (
                job_id, candidate_id, cover_letter, resume_id, status
            ) VALUES ($1, $2, $3, $4, 'applied')
            RETURNING *`,
            [jobId, candidateId, cover_letter, resume_id]
        );

        // Update job applications count
        await query(
            'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = $1',
            [jobId]
        );

        logger.info(`Job application created: ${jobId} by candidate ${candidateId}`);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Apply to job error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to submit application'
        });
    }
};

// Withdraw application (candidate)
exports.withdrawApplication = async (req, res) => {
    try {
        const { jobId } = req.params;
        const candidateId = await getCandidateId(req.user.id);

        const result = await query(
            `DELETE FROM job_applications 
             WHERE job_id = $1 AND candidate_id = $2 
             RETURNING id`,
            [jobId, candidateId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        // Update job applications count
        await query(
            'UPDATE jobs SET applications_count = GREATEST(applications_count - 1, 0) WHERE id = $1',
            [jobId]
        );

        logger.info(`Application withdrawn: ${jobId} by candidate ${candidateId}`);

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

// Get applications for a company's jobs (company/admin)
exports.getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { status, page = 1, limit = 20 } = req.query;

        // Verify company owns this job
        const companyId = await getCompanyId(req.user.id);
        
        let whereClause = 'WHERE ja.job_id = $1';
        const values = [jobId];
        let paramIndex = 2;

        // If not admin, verify company owns the job
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            const jobCheck = await query(
                'SELECT id FROM jobs WHERE id = $1 AND company_id = $2',
                [jobId, companyId]
            );
            
            if (jobCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have access to this job\'s applications'
                });
            }
        }

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

        // Get applications
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const mainQuery = `
            SELECT 
                ja.id, ja.status, ja.cover_letter, ja.applied_at, ja.updated_at,
                ja.screening_score, ja.screening_notes, ja.interview_date, 
                ja.interview_mode, ja.offer_salary, ja.offer_date,
                cp.first_name, cp.last_name, u.email, cp.phone, cp.location,
                cp.education, cp.experience, cp.skills,
                r.file_name as resume_name, r.file_path as resume_url
            FROM job_applications ja
            JOIN candidate_profiles cp ON ja.candidate_id = cp.id
            JOIN users u ON cp.user_id = u.id
            LEFT JOIN resumes r ON ja.resume_id = r.id
            ${whereClause}
            ORDER BY ja.applied_at DESC
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
                totalPages: Math.ceil(totalCount / parseInt(limit))
            }
        });
    } catch (err) {
        logger.error('Get job applications error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications'
        });
    }
};

// Update application status (company/admin)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { 
            status, 
            screening_score, 
            screening_notes,
            interview_date,
            interview_mode,
            offer_salary,
            notes
        } = req.body;

        // Verify company owns this application
        const companyId = await getCompanyId(req.user.id);
        
        const appCheck = await query(
            `SELECT ja.id, j.company_id 
             FROM job_applications ja
             JOIN jobs j ON ja.job_id = j.id
             WHERE ja.id = $1`,
            [applicationId]
        );

        if (appCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        // If not admin, verify company owns the job
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            if (appCheck.rows[0].company_id !== companyId) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have access to this application'
                });
            }
        }

        // Build update query
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (status) {
            updates.push(`status = $${paramIndex}`);
            values.push(status);
            paramIndex++;
        }
        if (screening_score !== undefined) {
            updates.push(`screening_score = $${paramIndex}`);
            values.push(screening_score);
            paramIndex++;
        }
        if (screening_notes !== undefined) {
            updates.push(`screening_notes = $${paramIndex}`);
            values.push(screening_notes);
            paramIndex++;
        }
        if (interview_date !== undefined) {
            updates.push(`interview_date = $${paramIndex}`);
            values.push(interview_date);
            paramIndex++;
        }
        if (interview_mode !== undefined) {
            updates.push(`interview_mode = $${paramIndex}`);
            values.push(interview_mode);
            paramIndex++;
        }
        if (offer_salary !== undefined) {
            updates.push(`offer_salary = $${paramIndex}`);
            values.push(offer_salary);
            paramIndex++;
        }
        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex}`);
            values.push(notes);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updates.push('updated_at = NOW()');
        values.push(applicationId);

        const result = await query(
            `UPDATE job_applications 
             SET ${updates.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING *`,
            values
        );

        logger.info(`Application status updated: ${applicationId} to ${status}`);

        res.json({
            success: true,
            message: 'Application updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Update application status error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update application'
        });
    }
};

// Get application statistics (company/admin)
exports.getApplicationStats = async (req, res) => {
    try {
        const companyId = await getCompanyId(req.user.id);
        
        let whereClause = '';
        const values = [];
        
        // If not admin, filter by company
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            whereClause = 'WHERE j.company_id = $1';
            values.push(companyId);
        }

        const stats = await query(`
            SELECT 
                COUNT(*) as total_applications,
                COUNT(*) FILTER (WHERE ja.status = 'applied') as pending,
                COUNT(*) FILTER (WHERE ja.status = 'screening') as screening,
                COUNT(*) FILTER (WHERE ja.status = 'interview') as interview,
                COUNT(*) FILTER (WHERE ja.status = 'offer') as offer,
                COUNT(*) FILTER (WHERE ja.status = 'hired') as hired,
                COUNT(*) FILTER (WHERE ja.status = 'rejected') as rejected
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            ${whereClause}
        `, values);

        res.json({
            success: true,
            data: stats.rows[0]
        });
    } catch (err) {
        logger.error('Get application stats error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application statistics'
        });
    }
};

