// config/database.js - PostgreSQL configuration with connection pooling
const { Pool } = require('pg');

// Load dotenv only once - check if already loaded
if (!process.env.DB_HOST) {
    const result = require('dotenv').config({ path: '.env' });
    if (result.error) {
        console.error('Error loading .env file:', result.error);
    } else {
        console.log('✓ .env file loaded successfully');
        console.log('DB_PASSWORD from env:', process.env.DB_PASSWORD ? '***present***' : '***missing***');
    }
}

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`Database configuration error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please ensure .env file is properly configured');
}

// Create PostgreSQL pool configuration - READ EXACTLY FROM PROCESS.ENV
const dbPassword = process.env.DB_PASSWORD || '';

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'rojgarsetu',
    user: process.env.DB_USER || 'postgres',
    password: dbPassword,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,  // Increased timeout for better reliability
};

// Log configuration (without password)
console.log('Database configuration:', {
    host: poolConfig.host,
    port: poolConfig.port,
    database: poolConfig.database,
    user: poolConfig.user,
    max: poolConfig.max
});

// Create the pool lazily (don't connect immediately)
let pool = null;

const getPool = () => {
    if (!pool) {
        console.log('Creating PostgreSQL connection pool...');
        pool = new Pool(poolConfig);
        
        pool.on('connect', () => {
            console.log('✓ PostgreSQL client connected to database');
        });

        pool.on('acquire', () => {
            console.log('✓ PostgreSQL client acquired from pool');
        });

        pool.on('error', (err) => {
            console.error('✗ Unexpected error on idle PostgreSQL client:', err.message);
        });

        pool.on('remove', () => {
            console.log('PostgreSQL client removed from pool');
        });
    }
    return pool;
};

// Test connection function
const testConnection = async () => {
    const p = getPool();
    const client = await p.connect();
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
    const p = getPool();
    const start = Date.now();
    try {
        const result = await p.query(text, params);
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
    const p = getPool();
    const client = await p.connect();
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
    if (!pool) {
        return { totalCount: 0, idleCount: 0, waitingCount: 0 };
    }
    return {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
    };
};

module.exports = {
    pool: { // Proxy to getPool for backwards compatibility
        get query() { return getPool().query; },
        get connect() { return getPool().connect; },
        get on() { return getPool().on; },
        get totalCount() { return pool ? pool.totalCount : 0; },
        get idleCount() { return pool ? pool.idleCount : 0; },
        get waitingCount() { return pool ? pool.waitingCount : 0; }
    },
    getPool,
    query,
    transaction,
    testConnection,
    getPoolStatus
};

