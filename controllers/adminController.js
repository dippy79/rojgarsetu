// controllers/adminController.js - Admin Management Controller
const { query } = require('../config/database');
const logger = require('../utils/logger');

// ============================================
// DASHBOARD STATS
// ============================================

exports.getDashboardStats = async (req, res) => {
    try {
        // Get total counts
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
                (SELECT COUNT(*) FROM users WHERE role = 'candidate' AND is_active = true) as total_candidates,
                (SELECT COUNT(*) FROM users WHERE role = 'company' AND is_active = true) as total_companies,
                (SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true) as total_admins,
                (SELECT COUNT(*) FROM jobs WHERE is_active = true) as total_jobs,
                (SELECT COUNT(*) FROM jobs WHERE is_active = true AND is_government = true) as government_jobs,
                (SELECT COUNT(*) FROM jobs WHERE is_active = true AND is_government = false) as private_jobs,
                (SELECT COUNT(*) FROM courses WHERE is_active = true) as total_courses,
                (SELECT COUNT(*) FROM job_applications) as total_applications,
                (SELECT COUNT(*) FROM job_applications WHERE created_at > NOW() - INTERVAL '7 days') as new_applications_7d
        `);

        // Get recent registrations (last 7 days)
        const recentRegistrations = await query(`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM-DD') as date,
                COUNT(*) as count
            FROM users
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
            ORDER BY date DESC
        `);

        // Get top job categories
        const topCategories = await query(`
            SELECT category, COUNT(*) as count
            FROM jobs
            WHERE is_active = true
            GROUP BY category
            ORDER BY count DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                ...stats.rows[0],
                recent_registrations: recentRegistrations.rows,
                top_categories: topCategories.rows
            }
        });
    } catch (err) {
        logger.error('Get dashboard stats error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
};

// ============================================
// USER MANAGEMENT
// ============================================

exports.getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20, is_active } = req.query;
        
        let whereClause = 'WHERE 1=1';
        const values = [];
        let paramIndex = 1;

        if (role) {
            whereClause += ` AND role = $${paramIndex}`;
            values.push(role);
            paramIndex++;
        }

        if (is_active !== undefined) {
            whereClause += ` AND is_active = $${paramIndex}`;
            values.push(is_active === 'true');
            paramIndex++;
        }

        if (search) {
            whereClause += ` AND (email ILIKE $${paramIndex} OR id::text ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM users ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get users
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(
            `SELECT id, email, role, is_active, email_verified, is_super_admin, 
                    created_at, last_login
             FROM users 
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...values, parseInt(limit), offset]
        );

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
        logger.error('Get users error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const { rows } = await query(
            `SELECT id, email, role, is_active, email_verified, is_super_admin, 
                    created_at, last_login
             FROM users WHERE id = $1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get additional profile info based on role
        let profileData = null;
        if (rows[0].role === 'candidate') {
            const profile = await query(
                'SELECT * FROM candidate_profiles WHERE user_id = $1',
                [id]
            );
            profileData = profile.rows[0];
        } else if (rows[0].role === 'company') {
            const profile = await query(
                'SELECT * FROM company_profiles WHERE user_id = $1',
                [id]
            );
            profileData = profile.rows[0];
        }

        res.json({
            success: true,
            data: {
                ...rows[0],
                profile: profileData
            }
        });
    } catch (err) {
        logger.error('Get user by ID error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_active, is_super_admin } = req.body;

        // Only super_admin can change roles and super_admin flag
        if (role || is_super_admin) {
            if (req.user.role !== 'super_admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Only super admins can change user roles'
                });
            }
        }

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (role) {
            updates.push(`role = $${paramIndex}`);
            values.push(role);
            paramIndex++;
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex}`);
            values.push(is_active);
            paramIndex++;
        }

        if (is_super_admin !== undefined && req.user.role === 'super_admin') {
            updates.push(`is_super_admin = $${paramIndex}`);
            values.push(is_super_admin);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const result = await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        logger.info(`User updated: ${id} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'User updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Update user error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update user'
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your own account'
            });
        }

        const result = await query(
            'DELETE FROM users WHERE id = $1 RETURNING id, email',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        logger.info(`User deleted: ${id} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        logger.error('Delete user error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user'
        });
    }
};

// ============================================
// JOB MANAGEMENT
// ============================================

exports.getAllJobs = async (req, res) => {
    try {
        const { search, category, is_active, is_featured, is_government, page = 1, limit = 20 } = req.query;

        let whereClause = 'WHERE 1=1';
        const values = [];
        let paramIndex = 1;

        if (search) {
            whereClause += ` AND (j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            whereClause += ` AND j.category = $${paramIndex}`;
            values.push(category);
            paramIndex++;
        }

        if (is_active !== undefined) {
            whereClause += ` AND j.is_active = $${paramIndex}`;
            values.push(is_active === 'true');
            paramIndex++;
        }

        if (is_featured !== undefined) {
            whereClause += ` AND j.is_featured = $${paramIndex}`;
            values.push(is_featured === 'true');
            paramIndex++;
        }

        if (is_government !== undefined) {
            whereClause += ` AND j.is_government = $${paramIndex}`;
            values.push(is_government === 'true');
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM jobs j ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get jobs
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(
            `SELECT j.*, c.company_name
             FROM jobs j
             LEFT JOIN company_profiles c ON j.company_id = c.id
             ${whereClause}
             ORDER BY j.created_at DESC
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...values, parseInt(limit), offset]
        );

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
        logger.error('Get all jobs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch jobs'
        });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active, is_featured, is_government } = req.body;

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex}`);
            values.push(is_active);
            paramIndex++;
        }

        if (is_featured !== undefined) {
            updates.push(`is_featured = $${paramIndex}`);
            values.push(is_featured);
            paramIndex++;
        }

        if (is_government !== undefined) {
            updates.push(`is_government = $${paramIndex}`);
            values.push(is_government);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const result = await query(
            `UPDATE jobs SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

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

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM jobs WHERE id = $1 RETURNING id, title',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Job not found'
            });
        }

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

// ============================================
// COURSE MANAGEMENT
// ============================================

exports.getAllCourses = async (req, res) => {
    try {
        const { search, category, is_active, is_featured, page = 1, limit = 20 } = req.query;

        let whereClause = 'WHERE 1=1';
        const values = [];
        let paramIndex = 1;

        if (search) {
            whereClause += ` AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            whereClause += ` AND c.category = $${paramIndex}`;
            values.push(category);
            paramIndex++;
        }

        if (is_active !== undefined) {
            whereClause += ` AND c.is_active = $${paramIndex}`;
            values.push(is_active === 'true');
            paramIndex++;
        }

        if (is_featured !== undefined) {
            whereClause += ` AND c.is_featured = $${paramIndex}`;
            values.push(is_featured === 'true');
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM courses c ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get courses
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(
            `SELECT c.*, cp.company_name as provider_name
             FROM courses c
             LEFT JOIN company_profiles cp ON c.provider_id = cp.id
             ${whereClause}
             ORDER BY c.created_at DESC
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...values, parseInt(limit), offset]
        );

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
        logger.error('Get all courses error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch courses'
        });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active, is_featured } = req.body;

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex}`);
            values.push(is_active);
            paramIndex++;
        }

        if (is_featured !== undefined) {
            updates.push(`is_featured = $${paramIndex}`);
            values.push(is_featured);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const result = await query(
            `UPDATE courses SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

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

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'DELETE FROM courses WHERE id = $1 RETURNING id, name',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

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

// ============================================
// ADMIN PROFILES MANAGEMENT (Super Admin only)
// ============================================

exports.getAdmins = async (req, res) => {
    try {
        const { admin_level, is_active } = req.query;

        let whereClause = 'WHERE 1=1';
        const values = [];
        let paramIndex = 1;

        if (admin_level) {
            whereClause += ` AND ap.admin_level = $${paramIndex}`;
            values.push(admin_level);
            paramIndex++;
        }

        if (is_active !== undefined) {
            whereClause += ` AND ap.is_active = $${paramIndex}`;
            values.push(is_active === 'true');
            paramIndex++;
        }

        const result = await query(
            `SELECT ap.*, u.email, u.is_active as user_active
             FROM admin_profiles ap
             JOIN users u ON ap.user_id = u.id
             ${whereClause}
             ORDER BY ap.created_at DESC`,
            values
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        logger.error('Get admins error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch admins'
        });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const { user_id, admin_level, permissions, assigned_regions } = req.body;

        // Check if user is already an admin
        const existing = await query(
            'SELECT id FROM admin_profiles WHERE user_id = $1',
            [user_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User is already an admin'
            });
        }

        const result = await query(
            `INSERT INTO admin_profiles (
                user_id, admin_level, permissions, assigned_regions, created_by
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [user_id, admin_level, permissions || {}, assigned_regions || [], req.user.id]
        );

        // Update user's role to admin
        await query(
            'UPDATE users SET role = $1 WHERE id = $2',
            ['admin', user_id]
        );

        logger.info(`Admin profile created: ${user_id} by ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Create admin error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create admin'
        });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_level, permissions, assigned_regions, is_active } = req.body;

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (admin_level) {
            updates.push(`admin_level = $${paramIndex}`);
            values.push(admin_level);
            paramIndex++;
        }

        if (permissions) {
            updates.push(`permissions = $${paramIndex}`);
            values.push(JSON.stringify(permissions));
            paramIndex++;
        }

        if (assigned_regions) {
            updates.push(`assigned_regions = $${paramIndex}`);
            values.push(assigned_regions);
            paramIndex++;
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex}`);
            values.push(is_active);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const result = await query(
            `UPDATE admin_profiles SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Admin profile not found'
            });
        }

        logger.info(`Admin updated: ${id} by ${req.user.email}`);

        res.json({
            success: true,
            message: 'Admin updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        logger.error('Update admin error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update admin'
        });
    }
};

// ============================================
// AUDIT LOGS (Super Admin only)
// ============================================

exports.getAuditLogs = async (req, res) => {
    try {
        const { action, entity_type, user_id, page = 1, limit = 50 } = req.query;

        let whereClause = 'WHERE 1=1';
        const values = [];
        let paramIndex = 1;

        if (action) {
            whereClause += ` AND action = $${paramIndex}`;
            values.push(action);
            paramIndex++;
        }

        if (entity_type) {
            whereClause += ` AND entity_type = $${paramIndex}`;
            values.push(entity_type);
            paramIndex++;
        }

        if (user_id) {
            whereClause += ` AND user_id = $${paramIndex}`;
            values.push(user_id);
            paramIndex++;
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get logs
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(
            `SELECT al.*, u.email as user_email
             FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.id
             ${whereClause}
             ORDER BY al.created_at DESC
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...values, parseInt(limit), offset]
        );

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
        logger.error('Get audit logs error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit logs'
        });
    }
};

