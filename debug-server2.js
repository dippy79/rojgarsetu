// debug-server2.js - More complete debug
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('1. Basic imports done');

const { pool, query, testConnection } = require('./config/database');
console.log('2. Database import done');

const logger = require('./utils/logger');
console.log('3. Logger import done');

const app = express();
const PORT = 5000;

// Minimal middleware - step by step
console.log('4. Adding middleware...');
app.use(helmet());
console.log('5. Helmet done');
app.use(cors());
console.log('6. CORS done');
app.use(express.json());
console.log('7. JSON parser done');

console.log('8. Adding routes...');

// Simple routes - no imports to avoid hanging
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

app.get('/test', (req, res) => {
    res.json({ test: 'ok' });
});

console.log('9. Routes added');

async function start() {
    console.log('10. Testing database...');
    try {
        const result = await testConnection();
        console.log('11. Database connected:', result.success);
    } catch (e) {
        console.log('11. Database error:', e.message);
    }
    
    console.log('12. Starting server on port', PORT);
    app.listen(PORT, () => {
        console.log(`✓ Server running on http://localhost:${PORT}`);
    });
}

start();
