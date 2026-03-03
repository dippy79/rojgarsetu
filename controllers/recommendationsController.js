// controllers/recommendationsController.js - Job Recommendations Controller
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

// Get personalized job recommendations for a candidate
exports.getJobRecommendations = async (req, res) => {
    try {
        const candidateId = await getCandidateId(req.user.id);
        
        if (!candidateId) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const { page = 1, limit = 20 } = req.query;

        // Get candidate's skills and preferences
        const candidateProfile = await query(
            `SELECT skill_tags, preferred_job_categories, preferred_job_types, 
                    preferred_locations, expected_salary_min, expected_salary_max
             FROM candidate_profiles 
             WHERE id = $1`,
            [candidateId]
        );

        if (candidateProfile.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const profile = candidateProfile.rows[0];
        const skills = profile.skill_tags || [];
        const preferredCategories = profile.preferred_job_categories || [];
        const preferredTypes = profile.preferred_job_types || [];
        const preferredLocations = profile.preferred_locations || [];

        // Build recommendation query based on candidate preferences
        let whereClause = 'WHERE j.is_active = true AND (j.last_date IS NULL OR j.last_date >= CURRENT_DATE)';
        const values = [];
        let paramIndex = 1;

        // Match skills
        if (skills.length > 0) {
            whereClause += ` AND j.skills_required && $${paramIndex}`;
            values.push(skills);
            paramIndex++;
        }

        // Match preferred categories
        if (preferredCategories.length > 0) {
            whereClause += ` AND j.category = ANY($${paramIndex}::varchar[])`;
            values.push(preferredCategories);
            paramIndex++;
        }

        // Match preferred job types
        if (preferredTypes.length > 0) {
            whereClause += ` AND j.type = ANY($${paramIndex}::varchar[])`;
            values.push(preferredTypes);
            paramIndex++;
        }

        // Match preferred locations (partial match)
        if (preferredLocations.length > 0) {
            whereClause += ` AND (`;
            preferredLocations.forEach((loc, idx) => {
                if (idx > 0) whereClause += ' OR ';
                whereClause += ` j.location ILIKE $${paramIndex}`;
                values.push(`%${loc}%`);
                paramIndex++;
            });
            whereClause += ')';
        }

        // Salary range match
        if (profile.expected_salary_min) {
            whereClause += ` AND (j.salary_max >= $${paramIndex} OR j.salary_max IS NULL)`;
            values.push(profile.expected_salary_min);
            paramIndex++;
        }

        // Exclude already applied jobs
        whereClause += ` AND j.id NOT IN (
            SELECT job_id FROM job_applications WHERE candidate_id = $1
        )`;
        values.push(candidateId);

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM jobs j ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get recommended jobs with scoring
        const offset = (parseInt(page) - 1) * parseInt(limit);
        
        // Calculate match score based on multiple factors
        const mainQuery = `
            SELECT 
                j.*,
                c.company_name,
                c.logo_url,
                -- Calculate match score
                (
                    -- Skill match score (0-30 points)
                    COALESCE(array_length(j.skills_required, 1), 0) * 2 +
                    -- Location match (20 points)
                    CASE WHEN j.location ILIKE ANY($${paramIndex}::varchar[]) THEN 20 ELSE 0 END +
                    -- Salary match (20 points)
                    CASE WHEN j.salary_max >= $${paramIndex + 1} OR j.salary_max IS NULL THEN 20 ELSE 0 END +
                    -- Recency bonus (10 points for jobs created in last 7 days)
                    CASE WHEN j.created_at > NOW() - INTERVAL '7 days' THEN 10 ELSE 0 END
                ) as match_score
            FROM jobs j
            LEFT JOIN company_profiles c ON j.company_id = c.id
            ${whereClause}
            ORDER BY match_score DESC, j.created_at DESC
            LIMIT $${paramIndex + 2} OFFSET $${paramIndex + 3}
        `;

        values.push(preferredLocations, profile.expected_salary_min || 0, parseInt(limit), offset);
        
        const result = await query(mainQuery, values);

        // Save recommendations to database for tracking
        if (result.rows.length > 0) {
            const insertValues = [];
            const insertPlaceholders = [];
            
            result.rows.forEach((job, idx) => {
                const baseParamIndex = paramIndex + 4 + (idx * 2);
                insertPlaceholders.push(`($${baseParamIndex}, $${baseParamIndex + 1}, $${baseParamIndex + 2})`);
                insertValues.push(candidateId, job.id, job.match_score);
            });

            if (insertPlaceholders.length > 0) {
                // Use ON CONFLICT to update existing recommendations
                await query(
                    `INSERT INTO job_recommendations (candidate_id, job_id, score)
                     VALUES ${insertPlaceholders.join(', ')}
                     ON CONFLICT (candidate_id, job_id) 
                     DO UPDATE SET score = EXCLUDED.score, created_at = NOW()`,
                    insertValues
                ).catch(err => logger.warn('Failed to save recommendations:', err.message));
            }
        }

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
        logger.error('Get job recommendations error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recommendations'
        });
    }
};

// Get recommendation feedback (click/apply)
exports.updateRecommendationFeedback = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { action } = req.body; // 'click' or 'dismiss'
        const candidateId = await getCandidateId(req.user.id);

        if (!candidateId) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        if (action === 'dismiss') {
            await query(
                `UPDATE job_recommendations 
                 SET is_dismissed = true 
                 WHERE candidate_id = $1 AND job_id = $2`,
                [candidateId, jobId]
            );
        } else if (action === 'click') {
            await query(
                `UPDATE job_recommendations 
                 SET clicked_at = NOW() 
                 WHERE candidate_id = $1 AND job_id = $2`,
                [candidateId, jobId]
            );
        }

        res.json({
            success: true,
            message: 'Feedback recorded'
        });
    } catch (err) {
        logger.error('Update recommendation feedback error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to record feedback'
        });
    }
};

// Get recommendation analytics
exports.getRecommendationAnalytics = async (req, res) => {
    try {
        const candidateId = await getCandidateId(req.user.id);

        if (!candidateId) {
            return res.status(404).json({
                success: false,
                error: 'Candidate profile not found'
            });
        }

        const analytics = await query(`
            SELECT 
                COUNT(*) as total_recommendations,
                COUNT(*) FILTER (WHERE is_relevant = true) as relevant,
                COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
                COUNT(*) FILTER (WHERE applied_at IS NOT NULL) as applied,
                COUNT(*) FILTER (WHERE is_dismissed = true) as dismissed,
                AVG(score) as avg_match_score
            FROM job_recommendations
            WHERE candidate_id = $1
        `, [candidateId]);

        // Get recent recommendations
        const recentJobs = await query(`
            SELECT jr.*, j.title, j.location, j.type
            FROM job_recommendations jr
            JOIN jobs j ON jr.job_id = j.id
            WHERE jr.candidate_id = $1
            ORDER BY jr.created_at DESC
            LIMIT 10
        `, [candidateId]);

        res.json({
            success: true,
            data: {
                ...analytics.rows[0],
                recent_recommendations: recentJobs.rows
            }
        });
    } catch (err) {
        logger.error('Get recommendation analytics error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
};

// Admin: Get recommendation performance stats
exports.getRecommendationStats = async (req, res) => {
    try {
        const stats = await query(`
            SELECT 
                COUNT(DISTINCT candidate_id) as total_candidates_with_recs,
                COUNT(*) as total_recommendations,
                COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as total_clicks,
                COUNT(*) FILTER (WHERE applied_at IS NOT NULL) as total_applications,
                AVG(score) as avg_match_score,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as recs_last_24h
            FROM job_recommendations
            WHERE is_relevant = true
        `);

        // Get top recommended jobs
        const topJobs = await query(`
            SELECT j.id, j.title, COUNT(jr.id) as recommendation_count,
                   COUNT(jr.id) FILTER (WHERE jr.clicked_at IS NOT NULL) as click_count,
                   COUNT(jr.id) FILTER (WHERE jr.applied_at IS NOT NULL) as apply_count
            FROM job_recommendations jr
            JOIN jobs j ON jr.job_id = j.id
            GROUP BY j.id, j.title
            ORDER BY recommendation_count DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            data: {
                ...stats.rows[0],
                top_jobs: topJobs.rows
            }
        });
    } catch (err) {
        logger.error('Get recommendation stats error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recommendation stats'
        });
    }
};

