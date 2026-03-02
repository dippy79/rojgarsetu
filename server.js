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

// Import job fetcher service
const { fetchAllJobsAndCourses, seedIfEmpty, getStats } = require('./services/jobFetcher');

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

// Health check endpoint with database connectivity and stats
app.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'unknown',
        stats: {
            jobs: 0,
            courses: 0
        }
    };
    
    try {
        // Test database connection with a simple query
        await query('SELECT 1 as health');
        healthCheck.database = 'connected';
        
        // Get stats
        try {
            const stats = await getStats();
            healthCheck.stats = {
                totalJobs: stats.totalJobs,
                governmentJobs: stats.governmentJobs,
                privateJobs: stats.privateJobs,
                totalCourses: stats.totalCourses
            };
        } catch (statsErr) {
            logger.warn('Could not fetch stats:', statsErr.message);
        }
        
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

// Test database connection with stats
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await query('SELECT NOW() as db_time, version() as pg_version');
        
        // Get stats
        let stats = { totalJobs: 0, totalCourses: 0 };
        try {
            stats = await getStats();
        } catch (e) {
            // Ignore stats error
        }
        
        res.json({ 
            success: true,
            dbTime: result.rows[0].db_time,
            pgVersion: result.rows[0].pg_version,
            stats: stats
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

// Every 6 hours: Fetch jobs and courses
// Runs at: 12 AM, 6 AM, 12 PM, 6 PM
cron.schedule('0 */6 * * *', async () => {
    logger.info('Running scheduled job & course fetch...');
    try {
        const result = await fetchAllJobsAndCourses();
        logger.info(`Scheduled fetch completed: ${result.totalInserted} new records inserted`);
    } catch (err) {
        logger.error('Scheduled job fetch failed:', err);
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
        console.log('\n=== RojgarSetu Server Starting ===');
        console.log('=================================');
        const dbTest = await testConnection();
        
        if (dbTest.success) {
            console.log('✓ Database connected successfully');
            
            // Seed data if database is empty
            console.log('\n--- Checking for seed data ---');
            try {
                const seedResult = await seedIfEmpty();
                if (seedResult && seedResult.seeded !== false) {
                    console.log(`✓ Seed data inserted: ${seedResult.totalInserted} new records`);
                    console.log(`  - Government Jobs: ${seedResult.governmentJobs.inserted}`);
                    console.log(`  - Private Jobs: ${seedResult.privateJobs.inserted}`);
                    console.log(`  - Courses: ${seedResult.courses.inserted}`);
                } else {
                    console.log('✓ Database already has data, skipping seed');
                }
                
                // Get and display stats
                const stats = await getStats();
                console.log('\n--- Database Stats ---');
                console.log(`  Total Jobs: ${stats.totalJobs}`);
                console.log(`  Government Jobs: ${stats.governmentJobs}`);
                console.log(`  Private Jobs: ${stats.privateJobs}`);
                console.log(`  Total Courses: ${stats.totalCourses}`);
                console.log('=====================\n');
            } catch (seedErr) {
                console.error('Seed data error:', seedErr.message);
            }
        } else {
            console.log('⚠ WARNING: Database Connection Failed');
            console.log('Server will start in degraded mode');
            console.log(`Error: ${dbTest.error}\n`);
        }

        // Start the server
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ Database: ${dbTest.success ? 'connected' : 'disconnected (degraded mode)'}`);
            console.log('\n=== API Endpoints ===');
            console.log(`  GET /health - Health check with stats`);
            console.log(`  GET /api/jobs - All jobs`);
            console.log(`  GET /api/jobs/featured - Featured jobs`);
            console.log(`  GET /api/jobs/government - Government jobs`);
            console.log(`  GET /api/jobs/private - Private jobs`);
            console.log(`  GET /api/courses - All courses`);
            console.log('====================\n');
        });
    } catch (err) {
        console.error('Failed to start server:', err.message);
        // Start server in degraded mode even if DB test throws
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT} (degraded mode)`);
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
