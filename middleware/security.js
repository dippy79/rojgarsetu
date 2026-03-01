// middleware/security.js - Rate limiting and security headers
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const logger = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json(options.message);
    }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res, next, options) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json(options.message);
    }
});

// Rate limiter for job applications (prevent spam)
const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 applications per hour
    message: {
        success: false,
        error: 'Application limit reached, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(`Application rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json(options.message);
    }
});

// Rate limiter for job posting (companies)
const jobPostLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each company to 5 job posts per hour
    message: {
        success: false,
        error: 'Job posting limit reached, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || req.ip, // Use user ID if available
    handler: (req, res, next, options) => {
        logger.warn(`Job post rate limit exceeded for user: ${req.user?.id || req.ip}`);
        res.status(429).json(options.message);
    }
});

// Helmet security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:"],
            fontSrc: ["'self'", "https:", "http:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for compatibility
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: true },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
});

// CORS configuration with dynamic origin support
const corsOptionsDelegate = (req, callback) => {
    // Guard clause - if no req object, allow all
    if (!req || typeof req !== 'object') {
        return callback(null, true);
    }
    
    // Get origin from request - safely handle missing header method
    let origin = null;
    try {
        origin = req.header ? req.header('Origin') : req.headers?.origin || null;
    } catch (e) {
        logger.warn('CORS: Error reading origin header:', e.message);
    }
    
    // Default allowed origins
    const defaultAllowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
    ];
    
    // GitHub Codespaces patterns
    const codespacePatterns = [
        /^https:\/\/.*-.*-.*-.*\.app\.github\.dev$/,
        /^https:\/\/.*-.*-.*\.app\.github\.dev$/,
        /^https:\/\/.*\.github\.dev$/
    ];
    
    // Vercel preview/production patterns
    const vercelPatterns = [
        /^https:\/\/.*-preview\..*$/,
        /^https:\/\/.*\.vercel\.app$/
    ];
    
    // Combine all patterns
    const allowedPatterns = [...codespacePatterns, ...vercelPatterns];
    
    // If ALLOWED_ORIGINS env var is set, use it
    let origins = defaultAllowedOrigins;
    if (process.env.ALLOWED_ORIGINS) {
        origins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    }
    
    // Check if origin is allowed
    const isAllowed = !origin || origins.includes(origin) || 
        allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
        callback(null, origin || true);
    } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    }
};

const corsOptions = {
    origin: corsOptionsDelegate,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'X-Client-Version'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    credentials: true,
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Request sanitization middleware
const sanitizeRequest = (req, res, next) => {
    // Defensive guard - ensure req object is valid
    if (!req || typeof req !== 'object') {
        return next();
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                // Remove potential NoSQL injection patterns
                req.query[key] = req.query[key].replace(/[${}]/g, '');
            }
        });
    }

    // Log suspicious requests
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /union\s+select/i,
        /exec\s*\(/i,
        /eval\s*\(/i
    ];

    const requestData = JSON.stringify({ 
        ...(req.body || {}), 
        ...(req.query || {}), 
        ...(req.params || {}) 
    });
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestData)) {
            logger.warn(`Suspicious request detected from ${req.ip || 'unknown'}: ${pattern.toString()}`);
            return res.status(400).json({
                success: false,
                error: 'Invalid request data'
            });
        }
    }

    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }

    // JWT expired
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired'
        });
    }

    // PostgreSQL error
    if (err.code && err.code.startsWith('23')) {
        return res.status(400).json({
            success: false,
            error: 'Database constraint violation',
            message: err.message
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
};

module.exports = {
    apiLimiter,
    authLimiter,
    applicationLimiter,
    jobPostLimiter,
    securityHeaders,
    corsOptions,
    sanitizeRequest,
    errorHandler,
    notFoundHandler
};
