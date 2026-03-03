// middleware/superAdminOnly.js - Super Admin Authorization Middleware
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware to check if the user is a super_admin
 * This middleware should be used AFTER the authenticate middleware
 */
const superAdminOnly = async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Check if user has super_admin role
        if (req.user.role !== 'super_admin') {
            logger.warn(`Super admin access attempt by ${req.user.email} (${req.user.role})`);
            return res.status(403).json({
                success: false,
                error: 'Access denied. Super admin privileges required.'
            });
        }

        // Additional check: Verify is_super_admin flag in database
        const { rows } = await query(
            'SELECT is_super_admin FROM users WHERE id = $1',
            [req.user.id]
        );

        if (rows.length === 0 || !rows[0].is_super_admin) {
            logger.warn(`Super admin flag check failed for ${req.user.email}`);
            return res.status(403).json({
                success: false,
                error: 'Access denied. Super admin account not verified.'
            });
        }

        logger.info(`Super admin access granted: ${req.user.email}`);
        next();
    } catch (error) {
        logger.error('Super admin authorization error:', error);
        res.status(500).json({
            success: false,
            error: 'Authorization check failed'
        });
    }
};

/**
 * Middleware to check if user is either admin or super_admin
 */
const adminOrSuperAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const allowedRoles = ['admin', 'super_admin'];
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Admin access attempt by ${req.user.email} (${req.user.role})`);
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        logger.error('Admin authorization error:', error);
        res.status(500).json({
            success: false,
            error: 'Authorization check failed'
        });
    }
};

/**
 * Middleware to check if user is an admin (including super_admin)
 */
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const allowedRoles = ['admin', 'super_admin'];
        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Admin access attempt by ${req.user.email} (${req.user.role})`);
            return res.status(403).json({
                success: false,
                error: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        logger.error('Admin authorization error:', error);
        res.status(500).json({
            success: false,
            error: 'Authorization check failed'
        });
    }
};

module.exports = {
    superAdminOnly,
    adminOrSuperAdmin,
    isAdmin
};

