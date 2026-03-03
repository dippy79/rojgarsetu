// middleware/errorHandler.js - Centralized error handling middleware
const logger = require('../utils/logger');

/**
 * Centralized error handler middleware
 * Handles all errors from routes, controllers, and services
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    // Mongoose/Monjo validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: Object.values(err.errors || {}).map(e => e.message)
        });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError' || err.message === 'Invalid token') {
        return res.status(401).json({
            success: false,
            error: 'Invalid authentication token'
        });
    }

    // JWT expired
    if (err.name === 'TokenExpiredError' || err.message === 'Token expired') {
        return res.status(401).json({
            success: false,
            error: 'Authentication token expired',
            code: 'TOKEN_EXPIRED'
        });
    }

    // PostgreSQL constraint violation
    if (err.code && err.code.startsWith('23')) {
        return res.status(400).json({
            success: false,
            error: 'Database constraint violation',
            message: err.message
        });
    }

    // Custom API Error
    if (err.isApiError) {
        return res.status(err.statusCode || 400).json({
            success: false,
            error: err.message,
            code: err.code
        });
    }

    // Default error - don't leak stack in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message;
    
    res.status(err.status || 500).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};

/**
 * Async handler wrapper to catch errors automatically
 * Usage: router.get('/', asyncHandler(async (req, res) => {...}))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
};

/**
 * Not implemented handler
 */
const notImplementedHandler = (req, res) => {
    res.status(501).json({
        success: false,
        error: 'This feature is not yet implemented'
    });
};

/**
 * Create a custom API error
 */
class ApiError extends Error {
    constructor(statusCode, message, code = 'ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isApiError = true;
        Error.captureStackTrace(this, this.constructor);
    }
    
    static badRequest(message, code = 'BAD_REQUEST') {
        return new ApiError(400, message, code);
    }
    
    static unauthorized(message = 'Unauthorized access', code = 'UNAUTHORIZED') {
        return new ApiError(401, message, code);
    }
    
    static forbidden(message = 'Access forbidden', code = 'FORBIDDEN') {
        return new ApiError(403, message, code);
    }
    
    static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
        return new ApiError(404, message, code);
    }
    
    static conflict(message, code = 'CONFLICT') {
        return new ApiError(409, message, code);
    }
    
    static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
        return new ApiError(500, message, code);
    }
}

module.exports = {
    errorHandler,
    asyncHandler,
    notFoundHandler,
    notImplementedHandler,
    ApiError
};

