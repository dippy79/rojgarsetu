// Test Express routes directly without starting server
const express = require('express');
const { query } = require('./config/database');

const app = express();

// Test route
app.get('/api/test-jobs', async (req, res) => {
    try {
        const result = await query(`
            SELECT id, title, organization, category, is_government, is_featured, apply_link
            FROM jobs 
            WHERE is_active = true 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Test directly
async function test() {
    try {
        const result = await query(`
            SELECT id, title, organization, category, is_government, is_featured
            FROM jobs 
            WHERE is_active = true 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log('=== Jobs API Test ===');
        console.log(JSON.stringify(result.rows, null, 2));
        
        // Check courses too
        const coursesResult = await query(`
            SELECT id, name, provider, category, is_featured
            FROM courses 
            WHERE is_active = true 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log('\n=== Courses API Test ===');
        console.log(JSON.stringify(coursesResult.rows, null, 2));
        
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit();
}

test();
