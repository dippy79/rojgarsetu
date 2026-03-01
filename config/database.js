// config/database.js - PostgreSQL configuration with connection pooling
const { Pool } = require('pg');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Database configuration error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please ensure .env file is properly configured');
}

// Create PostgreSQL pool configuration
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'rojgarsetu',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
};

// Log configuration (without password)
console.log('Database configuration:', {
    host: poolConfig.host,
    port: poolConfig.port,
    database: poolConfig.database,
    user: poolConfig.user,
    max: poolConfig.max
});

// Create the pool
const pool = new Pool(poolConfig);

// Connection event handlers
pool.on('connect', () => {
    console.log('✓ PostgreSQL client connected to database');
});

pool.on('acquire', () => {
    console.log('✓ PostgreSQL client acquired from pool');
});

pool.on('error', (err) => {
    console.error('✗ Unexpected error on idle PostgreSQL client:', err.message);
    // Don't exit on error - allow graceful degradation
});

pool.on('remove', () => {
    console.log('PostgreSQL client removed from pool');
});

// Test connection function
const testConnection = async () => {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT NOW() as now, current_user as user, current_database() as database');
        console.log('✓ Database connection test successful!');
        console.log(`  - Current time: ${result.rows[0].now}`);
        console.log(`  - User: ${result.rows[0].user}`);
        console.log(`  - Database: ${result.rows[0].database}`);
        return { success: true, info: result.rows[0] };
    } catch (err) {
        console.error('✗ Database connection test failed:', err.message);
        return { success: false, error: err.message };
    } finally {
        client.release();
    }
};

// Query helper with logging
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Query executed', { 
            text: text.substring(0, 100), 
            duration: `${duration}ms`, 
            rows: result.rowCount 
        });
        return result;
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
};

// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction rolled back:', error.message);
        throw error;
    } finally {
        client.release();
    }
};

// Get pool status
const getPoolStatus = () => {
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    };
};

module.exports = {
    pool,
    query,
    transaction,
    testConnection,
    getPoolStatus
};
