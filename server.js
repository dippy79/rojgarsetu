// server.js - Main server entry point for RojgarSetu API
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Import configurations and utilities
const { pool, query } = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const jobsRoutes = require('./routes/jobs');
const coursesRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');

// Import middleware
const { 
    apiLimiter, 
    securityHeaders, 
    sanitizeRequest, 
    errorHandler, 
    notFoundHandler,
    corsOptions 
} = require('./middleware/security');

// Import crawler
const { scrapeGovJobs } = require('./crawler/jobCrawler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(sanitizeRequest);

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsing - with size limits for security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/courses', coursesRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        name: 'RojgarSetu API',
        version: '2.0.0',
        description: 'Professional job and course portal API',
        endpoints: {
            auth: '/api/auth',
            jobs: '/api/jobs',
            courses: '/api/courses',
            health: '/health'
        }
    });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await query('SELECT NOW() as db_time, version() as pg_version');
        res.json({ 
            success: true,
            dbTime: result.rows[0].db_time,
            pgVersion: result.rows[0].pg_version
        });
    } catch (err) {
        logger.error('Database connection test failed:', err);
        res.status(500).json({ 
            success: false,
            error: 'Database connection failed' 
        });
    }
});

// Scheduled tasks

// Daily at 8 AM: run crawler
cron.schedule('0 8 * * *', async () => {
    logger.info('Running daily job crawler...');
    try {
        await scrapeGovJobs();
        logger.info('Job crawler finished successfully');
    } catch (err) {
        logger.error('Job crawler failed:', err);
    }
});

// Daily at midnight: mark expired jobs
cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date();
        const result = await query(
            'UPDATE jobs SET is_active = false WHERE last_date < $1 AND is_active = true',
            [today]
        );
        if (result.rowCount > 0) {
            logger.info(`Marked ${result.rowCount} jobs as inactive (expired)`);
        }
    } catch (err) {
        logger.error('Failed to update expired jobs:', err);
    }
});

// Weekly: Clean up old refresh tokens
cron.schedule('0 2 * * 0', async () => {
    try {
        const result = await query(
            'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
        );
        logger.info(`Cleaned up ${result.rowCount} expired refresh tokens`);
    } catch (err) {
        logger.error('Failed to clean up refresh tokens:', err);
    }
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = app;
