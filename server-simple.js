// server-simple.js - Simplified server startup without seeding
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import configs
const { pool, testConnection } = require('./config/database');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(sanitizeRequest);

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Health check
app.get('/health', async (req, res) => {
    const healthCheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'unknown'
    };
    
    try {
        await pool.query('SELECT 1 as health');
        healthCheck.database = 'connected';
        res.status(200).json(healthCheck);
    } catch (err) {
        healthCheck.status = 'degraded';
        healthCheck.database = 'disconnected';
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
        endpoints: {
            health: '/health',
            jobs: '/api/jobs',
            courses: '/api/courses'
        }
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
    console.log('\n=== RojgarSetu Server Starting ===');
    
    try {
        const dbTest = await testConnection();
        if (dbTest.success) {
            console.log('✓ Database connected');
        } else {
            console.log('⚠ Database not connected');
        }
    } catch (err) {
        console.log('⚠ Database error:', err.message);
    }

    app.listen(PORT, () => {
        console.log(`✓ Server running on http://localhost:${PORT}`);
        console.log('=================================\n');
    });
};

startServer();

module.exports = app;
