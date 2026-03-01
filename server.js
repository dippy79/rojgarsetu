// server.js - Main server entry point for RojgarSetu API
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Import configurations and utilities
const { pool, query, testConnection } = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const jobsRoutes = require('./routes/jobs');
const coursesRoutes = require('./routes/courses');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const companyRoutes = require('./routes/company');
const notificationsRoutes = require('./routes/notifications');

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
const PORT = process.env.PORT || 5000;

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

// Health check endpoint with database connectivity
app.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'unknown'
    };
    
    try {
        // Test database connection with a simple query
        await query('SELECT 1 as health');
        healthCheck.database = 'connected';
        
        res.status(200).json(healthCheck);
    } catch (err) {
        logger.error('Health check - Database connection failed:', err.message);
        healthCheck.status = 'degraded';
        healthCheck.database = 'disconnected';
        healthCheck.error = err.message;
        
        res.status(503).json(healthCheck);
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/notifications', notificationsRoutes);

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
            profile: '/api/profile',
            company: '/api/company',
            notifications: '/api/notifications',
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

// Start server with database connection test
const startServer = async () => {
    try {
        // Test database connection before starting server
        console.log('\n=== Testing Database Connection ===');
        const dbTest = await testConnection();
        
        if (dbTest.success) {
            console.log('=== Database Connection Successful ===\n');
        } else {
            console.log('=== WARNING: Database Connection Failed ===');
            console.log('Server will start in degraded mode (database features may not work)');
            console.log(`Error: ${dbTest.error}\n`);
        }

        // Start the server
        app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`Database: ${dbTest.success ? 'connected' : 'disconnected (degraded mode)'}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        // Start server in degraded mode even if DB test throws
        app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT} (degraded mode)`);
            logger.error('Database unavailable');
        });
    }
};

startServer();

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
