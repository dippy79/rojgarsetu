// debug-server.js - Debug what's blocking server startup
require('dotenv').config();
const express = require('express');

console.log('1. After dotenv config');

const { pool, query, testConnection } = require('./config/database');
console.log('2. After database import');

const logger = require('./utils/logger');
console.log('3. After logger import');

const app = express();
const PORT = 5000;

app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', db: 'connected' });
    } catch (e) {
        res.status(500).json({ status: 'error', db: 'disconnected' });
    }
});

async function start() {
    console.log('4. Before database test');
    try {
        const result = await testConnection();
        console.log('5. Database test result:', result.success);
    } catch (e) {
        console.log('5. Database test error:', e.message);
    }
    
    console.log('6. Before app.listen');
    app.listen(PORT, () => {
        console.log(`✓ Server running on http://localhost:${PORT}`);
    });
}

start();
