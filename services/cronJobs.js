// services/cronJobs.js - Centralized cron job management
const cron = require('node-cron');
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Import services
const { scrapeGovJobs } = require('../crawler/jobCrawler');
const { fetchAllJobsAndCourses } = require('./jobFetcher');

/**
 * Cleanup expired jobs - mark inactive
 */
async function cleanupExpiredJobs() {
    try {
        const today = new Date();
        const result = await query(
            'UPDATE jobs SET is_active = false WHERE last_date < $1 AND is_active = true',
            [today]
        );
        
        if (result.rowCount > 0) {
            logger.info(`Marked ${result.rowCount} jobs as inactive (expired)`);
        }
        
        return { success: true, updatedCount: result.rowCount };
    } catch (err) {
        logger.error('Failed to cleanup expired jobs:', err);
        throw err;
    }
}

/**
 * Cleanup expired refresh tokens
 */
async function cleanupExpiredTokens() {
    try {
        const result = await query(
            'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
        );
        
        logger.info(`Cleaned up ${result.rowCount} expired refresh tokens`);
        return { success: true, deletedCount: result.rowCount };
    } catch (err) {
        logger.error('Failed to cleanup refresh tokens:', err);
        throw err;
    }
}

/**
 * Run daily job crawler
 */
async function runJobCrawler() {
    const startTime = new Date();
    logger.info('========================================');
    logger.info('CRON JOB STARTED: Daily job crawler');
    logger.info(`Start Time: ${startTime.toISOString()}`);
    
    try {
        const result = await scrapeGovJobs();
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        
        logger.info(`Job crawler finished successfully in ${duration}s`);
        logger.info(`Result: ${JSON.stringify(result)}`);
        logger.info(`End Time: ${endTime.toISOString()}`);
        logger.info('========================================');
        
        return { success: true, duration, result };
    } catch (err) {
        const endTime = new Date();
        logger.error(`Job crawler failed at ${endTime.toISOString()}:`, err);
        logger.error('Stack:', err.stack);
        logger.info('========================================');
        
        throw err;
    }
}

/**
 * Run job & course fetcher
 */
async function runJobCourseFetcher() {
    const startTime = new Date();
    logger.info('========================================');
    logger.info('CRON JOB STARTED: Scheduled job & course fetch');
    logger.info(`Start Time: ${startTime.toISOString()}`);
    
    try {
        const result = await fetchAllJobsAndCourses();
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        
        logger.info(`Scheduled fetch completed in ${duration}s`);
        logger.info(`Total new records inserted: ${result.totalInserted}`);
        logger.info(`End Time: ${endTime.toISOString()}`);
        logger.info('========================================');
        
        return { success: true, duration, ...result };
    } catch (err) {
        const endTime = new Date();
        logger.error(`Scheduled job fetch failed at ${endTime.toISOString()}:`, err);
        logger.error('Stack:', err.stack);
        logger.info('========================================');
        
        throw err;
    }
}

// Scheduled cron jobs
let scheduledJobs = {};

/**
 * Initialize all scheduled cron jobs
 */
function initCronJobs() {
    logger.info('Initializing cron jobs...');
    
    // Daily at 8 AM: run crawler
    scheduledJobs.dailyCrawler = cron.schedule('0 8 * * *', async () => {
        try {
            await runJobCrawler();
        } catch (err) {
            logger.error('Daily crawler cron failed:', err.message);
        }
    });
    
    // Every 6 hours: Fetch jobs and courses
    scheduledJobs.sixHourFetcher = cron.schedule('0 */6 * * *', async () => {
        try {
            await runJobCourseFetcher();
        } catch (err) {
            logger.error('6-hour fetcher cron failed:', err.message);
        }
    });
    
    // Daily at midnight: mark expired jobs
    scheduledJobs.dailyCleanup = cron.schedule('0 0 * * *', async () => {
        try {
            await cleanupExpiredJobs();
        } catch (err) {
            logger.error('Daily cleanup cron failed:', err.message);
        }
    });
    
    // Weekly: Clean up old refresh tokens (Sunday at 2 AM)
    scheduledJobs.weeklyTokenCleanup = cron.schedule('0 2 * * 0', async () => {
        try {
            await cleanupExpiredTokens();
        } catch (err) {
            logger.error('Weekly token cleanup cron failed:', err.message);
        }
    });
    
    logger.info('Cron jobs initialized successfully');
}

/**
 * Stop all cron jobs
 */
function stopCronJobs() {
    Object.values(scheduledJobs).forEach(job => job.stop());
    logger.info('All cron jobs stopped');
}

/**
 * Get cron job status
 */
function getCronStatus() {
    return {
        dailyCrawler: scheduledJobs.dailyCrawler ? 'running' : 'stopped',
        sixHourFetcher: scheduledJobs.sixHourFetcher ? 'running' : 'stopped',
        dailyCleanup: scheduledJobs.dailyCleanup ? 'running' : 'stopped',
        weeklyTokenCleanup: scheduledJobs.weeklyTokenCleanup ? 'running' : 'stopped'
    };
}

module.exports = {
    // Cron job functions
    runJobCrawler,
    runJobCourseFetcher,
    cleanupExpiredJobs,
    cleanupExpiredTokens,
    
    // Cron management
    initCronJobs,
    stopCronJobs,
    getCronStatus
};

