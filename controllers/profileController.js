// controllers/profileController.js - Profile management controller
const { query, transaction } = require('../config/database');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

// Get candidate profile with stats
exports.getCandidateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get profile with stats
        const profileResult = await query(`
            SELECT 
                u.id, u.email, u.role, u.created_at,
                cp.first_name, cp.last_name, cp.phone, cp.location,
                cp.education, cp.experience, cp.skills, cp.bio,
                cp.linkedin_url, cp.portfolio_url, cp.resume_url,
                cp.expected_salary_min, cp.expected_salary_max,
                cp.preferred_job_types, cp.preferred_locations,
                -- Profile completeness
                CASE 
                    WHEN cp.first_name IS NOT NULL AND cp.last_name IS NOT NULL 
                    AND cp.phone IS NOT NULL AND cp.location IS NOT NULL 
                    AND cp.education IS NOT NULL AND cp.skills IS NOT NULL
                    THEN 100
                    WHEN cp.first_name IS NOT NULL AND cp.last_name IS NOT NULL
                    THEN 30
                    ELSE 10
                END as profile_completeness
            FROM users u
            LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
            WHERE u.id = $1
        `, [userId]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        const profile = profileResult.rows[0];

        // Get stats
        const statsResult = await query(`
            SELECT 
                (SELECT COUNT(*) FROM job_applications WHERE candidate_id = $1) as applications_count,
                (SELECT COUNT(*) FROM saved_jobs WHERE candidate_id = $1) as saved_jobs_count,
                (SELECT COUNT(*) FROM saved_courses WHERE candidate_id = $1) as saved_courses_count
        `, [profile.id]);

        // Get recent applications
        const recentAppsResult = await query(`
            SELECT ja.id, ja.status, ja.applied_at, j.title, j.location, c.company_name
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE ja.candidate_id = $1
            ORDER BY ja.applied_at DESC
            LIMIT 5
        `, [profile.id]);

        res.json({
            success: true,
            data: {
                ...profile,
                stats: statsResult.rows[0],
                recentApplications: recentAppsResult.rows
            }
        });
    } catch (error) {
        logger.error('Get candidate profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
};

// Get company profile with stats
exports.getCompanyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get company profile
        const profileResult = await query(`
            SELECT 
                u.id, u.email, u.role, u.created_at,
                comp.company_name, comp.company_slug, comp.description,
                comp.website, comp.logo_url, comp.industry,
                comp.company_size, comp.location, comp.phone, comp.verified,
                comp.created_at as company_since
            FROM users u
            LEFT JOIN company_profiles comp ON u.id = comp.user_id
            WHERE u.id = $1
        `, [userId]);

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company profile not found'
            });
        }

        const company = profileResult.rows[0];

        // Get company stats
        const statsResult = await query(`
            SELECT 
                COUNT(*) as total_jobs,
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_jobs,
                SUM(views) as total_views,
                SUM(applications_count) as total_applications
            FROM jobs
            WHERE company_id = $1
        `, [company.id]);

        // Get recent applicants
        const recentAppsResult = await query(`
            SELECT ja.id, ja.status, ja.applied_at, ja.notes,
                   j.title as job_title,
                   cp.first_name, cp.last_name, cp.email as candidate_email,
                   cp.skills, cp.location as candidate_location
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            JOIN candidate_profiles cp ON ja.candidate_id = cp.id
            WHERE j.company_id = $1
            ORDER BY ja.applied_at DESC
            LIMIT 10
        `, [company.id]);

        res.json({
            success: true,
            data: {
                ...company,
                stats: statsResult.rows[0],
                recentApplicants: recentAppsResult.rows
            }
        });
    } catch (error) {
        logger.error('Get company profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company profile'
        });
    }
};

// Update candidate profile
exports.updateCandidateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Get candidate profile ID
        const profileResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        const profileId = profileResult.rows[0].id;

        // Allowed fields for update
        const allowedFields = [
            'firstName', 'lastName', 'phone', 'location',
            'education', 'experience', 'skills', 'bio',
            'linkedinUrl', 'portfolioUrl', 'resumeUrl',
            'expectedSalaryMin', 'expectedSalaryMax',
            'preferredJobTypes', 'preferredLocations'
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

        values.push(profileId);

        await query(
            `UPDATE candidate_profiles 
             SET ${setClause.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}`,
            values
        );

        logger.info(`Candidate profile updated: ${userId}`);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        logger.error('Update candidate profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

// Update company profile
exports.updateCompanyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Get company profile ID
        const profileResult = await query(
            'SELECT id FROM company_profiles WHERE user_id = $1',
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company profile not found'
            });
        }

        const companyId = profileResult.rows[0].id;

        // Allowed fields for update
        const allowedFields = [
            'companyName', 'description', 'website', 'logoUrl',
            'industry', 'companySize', 'location', 'phone'
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

        values.push(companyId);

        await query(
            `UPDATE company_profiles 
             SET ${setClause.join(', ')}, updated_at = NOW()
             WHERE id = $${paramIndex}`,
            values
        );

        logger.info(`Company profile updated: ${userId}`);

        res.json({
            success: true,
            message: 'Company profile updated successfully'
        });
    } catch (error) {
        logger.error('Update company profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update company profile'
        });
    }
};

// Upload resume
exports.uploadResume = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Only PDF and DOCX are allowed'
            });
        }

        // Validate file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 5MB'
            });
        }

        // Get candidate profile
        const profileResult = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [userId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        // Update resume URL
        const resumeUrl = `/uploads/resumes/${req.file.filename}`;
        
        await query(
            'UPDATE candidate_profiles SET resume_url = $1, updated_at = NOW() WHERE user_id = $2',
            [resumeUrl, userId]
        );

        logger.info(`Resume uploaded for user: ${userId}`);

        res.json({
            success: true,
            message: 'Resume uploaded successfully',
            data: {
                resumeUrl
            }
        });
    } catch (error) {
        logger.error('Upload resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload resume'
        });
    }
};

// Upload certificate
exports.uploadCertificate = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid file type. Only PDF, JPG, and PNG are allowed'
            });
        }

        // Validate file size (max 2MB)
        if (req.file.size > 2 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 2MB'
            });
        }

        const certificateUrl = `/uploads/certificates/${req.file.filename}`;

        // Store certificate reference (could be extended to a separate table)
        logger.info(`Certificate uploaded for user: ${userId}`);

        res.json({
            success: true,
            message: 'Certificate uploaded successfully',
            data: {
                certificateUrl,
                originalName: req.file.originalname
            }
        });
    } catch (error) {
        logger.error('Upload certificate error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload certificate'
        });
    }
};

// Get candidate dashboard data
exports.getCandidateDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get profile completeness
        const profileResult = await query(`
            SELECT 
                CASE 
                    WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
                    AND phone IS NOT NULL AND location IS NOT NULL 
                    AND education IS NOT NULL AND skills IS NOT NULL
                    THEN 100
                    WHEN first_name IS NOT NULL AND last_name IS NOT NULL
                    THEN 30
                    ELSE 10
                END as profile_completeness
            FROM candidate_profiles
            WHERE user_id = $1
        `, [userId]);

        // Get application stats
        const appStatsResult = await query(`
            SELECT 
                COUNT(*) as total_applied,
                SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'interview' THEN 1 ELSE 0 END) as interview,
                SUM(CASE WHEN status = 'hired' THEN 1 ELSE 0 END) as hired,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM job_applications ja
            JOIN candidate_profiles cp ON ja.candidate_id = cp.id
            WHERE cp.user_id = $1
        `, [userId]);

        // Get saved jobs count
        const savedJobsResult = await query(`
            SELECT COUNT(*) as saved_jobs_count
            FROM saved_jobs sj
            JOIN candidate_profiles cp ON sj.candidate_id = cp.id
            WHERE cp.user_id = $1
        `, [userId]);

        // Get recommended jobs (based on skills)
        const recommendedJobsResult = await query(`
            SELECT j.id, j.title, j.location, j.type, j.salary_min, j.salary_max,
                   c.company_name, c.logo_url
            FROM jobs j
            LEFT JOIN company_profiles c ON j.company_id = c.id
            WHERE j.is_active = true 
            AND (j.last_date IS NULL OR j.last_date >= CURRENT_DATE)
            ORDER BY j.created_at DESC
            LIMIT 5
        `);

        // Get upcoming deadlines
        const upcomingDeadlines = await query(`
            SELECT j.id, j.title, j.last_date
            FROM jobs j
            WHERE j.is_active = true 
            AND j.last_date IS NOT NULL
            AND j.last_date >= CURRENT_DATE
            AND j.last_date <= CURRENT_DATE + INTERVAL '7 days'
            ORDER BY j.last_date ASC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                profileCompleteness: profileResult.rows[0]?.profile_completeness || 0,
                applicationStats: appStatsResult.rows[0],
                savedJobsCount: parseInt(savedJobsResult.rows[0]?.saved_jobs_count || 0),
                recommendedJobs: recommendedJobsResult.rows,
                upcomingDeadlines: upcomingDeadlines.rows
            }
        });
    } catch (error) {
        logger.error('Get candidate dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
};

// Get company dashboard data
exports.getCompanyDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get company profile
        const companyResult = await query(
            'SELECT id, company_name FROM company_profiles WHERE user_id = $1',
            [userId]
        );

        if (companyResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Company not found'
            });
        }

        const companyId = companyResult.rows[0].id;
        const companyName = companyResult.rows[0].company_name;

        // Get job stats
        const jobStatsResult = await query(`
            SELECT 
                COUNT(*) as total_jobs,
                SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_jobs,
                SUM(views) as total_views,
                SUM(applications_count) as total_applications
            FROM jobs
            WHERE company_id = $1
        `, [companyId]);

        // Get applicant stats by status
        const applicantStatsResult = await query(`
            SELECT 
                ja.status,
                COUNT(*) as count
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            WHERE j.company_id = $1
            GROUP BY ja.status
        `, [companyId]);

        // Get recent applications
        const recentAppsResult = await query(`
            SELECT ja.id, ja.status, ja.applied_at, ja.notes,
                   j.title as job_title,
                   cp.first_name, cp.last_name, cp.email as candidate_email,
                   cp.skills, cp.location as candidate_location
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.id
            JOIN candidate_profiles cp ON ja.candidate_id = cp.id
            WHERE j.company_id = $1
            ORDER BY ja.applied_at DESC
            LIMIT 10
        `, [companyId]);

        // Get top performing jobs
        const topJobsResult = await query(`
            SELECT id, title, views, applications_count
            FROM jobs
            WHERE company_id = $1
            ORDER BY applications_count DESC
            LIMIT 5
        `, [companyId]);

        res.json({
            success: true,
            data: {
                companyName,
                jobStats: jobStatsResult.rows[0],
                applicantStats: applicantStatsResult.rows,
                recentApplications: recentAppsResult.rows,
                topJobs: topJobsResult.rows
            }
        });
    } catch (error) {
        logger.error('Get company dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch company dashboard'
        });
    }
};
