// config/appConfig.js - Application-level configuration
require('dotenv').config();

module.exports = {
    // Server configuration
    server: {
        port: process.env.PORT || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        apiPrefix: '/api'
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
        expiresIn: '24h',
        refreshExpiresIn: '7d'
    },

    // Database configuration
    database: {
        poolMin: process.env.DB_POOL_MIN || 2,
        poolMax: process.env.DB_POOL_MAX || 10,
        idleTimeout: 30000,
        connectionTimeout: 2000
    },

    // Pagination defaults
    pagination: {
        defaultLimit: 12,
        maxLimit: 100,
        jobLimit: 20,
        courseLimit: 20,
        applicationLimit: 20
    },

    // File upload configuration
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
    },

    // Rate limiting configuration
    rateLimit: {
        apiWindow: 15 * 60 * 1000, // 15 minutes
        apiMax: 100,
        authWindow: 15 * 60 * 1000,
        authMax: 5,
        applicationWindow: 60 * 60 * 1000, // 1 hour
        applicationMax: 10
    },

    // CORS configuration
    cors: {
        allowedOrigins: (process.env.ALLOWED_ORIGINS || 
            'http://localhost:3000,http://localhost:3001').split(',')
    },

    // Job crawler configuration
    crawler: {
        userAgent: 'RojgarSetu/1.0',
        timeout: 30000,
        maxRetries: 3,
        batchSize: 50
    },

    // Job fetcher configuration
    fetcher: {
        batchSize: 50,
        apiTimeout: 10000
    },

    // Cache configuration (for future use)
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: 300 // 5 minutes default
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log'
    },

    // Feature flags
    features: {
        emailVerification: process.env.EMAIL_VERIFICATION === 'true',
        socialLogin: process.env.SOCIAL_LOGIN === 'true',
        jobAlerts: process.env.JOB_ALERTS === 'true'
    },

    // User roles
    roles: {
        CANDIDATE: 'candidate',
        EMPLOYER: 'employer',
        ADMIN: 'admin',
        SUPER_ADMIN: 'super_admin'
    },

    // Application statuses
    statuses: {
        // Job application status
        APPLICATION: {
            PENDING: 'pending',
            REVIEWING: 'reviewing',
            SHORTLISTED: 'shortlisted',
            REJECTED: 'rejected',
            ACCEPTED: 'accepted',
            WITHDRAWN: 'withdrawn'
        },
        // Job status
        JOB: {
            DRAFT: 'draft',
            ACTIVE: 'active',
            EXPIRED: 'expired',
            CLOSED: 'closed'
        }
    }
};

