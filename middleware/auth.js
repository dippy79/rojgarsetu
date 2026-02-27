// middleware/auth.js - JWT Authentication and RBAC
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Generate tokens
const generateTokens = (userId, role) => {
    const accessToken = jwt.sign(
        { userId, role, type: 'access' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                error: 'Access denied. No token provided.' 
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid or expired token' 
            });
        }

        // Check if user exists and is active
        const { rows } = await query(
            'SELECT id, email, role, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        const user = rows[0];

        if (!user.is_active) {
            return res.status(403).json({ 
                success: false,
                error: 'Account is deactivated' 
            });
        }

        // Attach user info to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        logger.info(`Authenticated user: ${user.email} (${user.role})`);
        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Authentication failed' 
        });
    }
};

// Role-based access control middleware
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by ${req.user.email} (${req.user.role})`);
            return res.status(403).json({ 
                success: false,
                error: 'Access denied. Insufficient permissions.' 
            });
        }

        next();
    };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);
        
        try {
            const decoded = verifyToken(token);
            const { rows } = await query(
                'SELECT id, email, role, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );

            if (rows.length > 0 && rows[0].is_active) {
                req.user = {
                    id: rows[0].id,
                    email: rows[0].email,
                    role: rows[0].role
                };
            }
        } catch (error) {
            // Token invalid, but continue as guest
            req.user = null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Company ownership check middleware
const requireCompanyOwnership = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }

        // Admin can access any company
        if (req.user.role === 'admin') {
            return next();
        }

        // Get company profile for this user
        const { rows } = await query(
            'SELECT id FROM company_profiles WHERE user_id = $1',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ 
                success: false,
                error: 'Company profile not found' 
            });
        }

        req.companyId = rows[0].id;
        next();
    } catch (error) {
        logger.error('Company ownership check error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Authorization check failed' 
        });
    }
};

// Candidate profile check middleware
const requireCandidateProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                error: 'Authentication required' 
            });
        }

        // Get candidate profile for this user
        const { rows } = await query(
            'SELECT id FROM candidate_profiles WHERE user_id = $1',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ 
                success: false,
                error: 'Candidate profile not found. Please complete your profile.' 
            });
        }

        req.candidateId = rows[0].id;
        next();
    } catch (error) {
        logger.error('Candidate profile check error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Authorization check failed' 
        });
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth,
    requireCompanyOwnership,
    requireCandidateProfile,
    generateTokens,
    verifyToken,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
