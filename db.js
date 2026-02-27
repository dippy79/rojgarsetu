// db.js - SQLite version for development/testing
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'rojgarsetu.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('SQLite database connected successfully at', dbPath);
    }
});

// Promisify db methods for async/await compatibility
const pool = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            // Convert PostgreSQL $1, $2, etc. to SQLite ? placeholders
            const sqliteSql = sql.replace(/\$\d+/g, '?');
            
            // Handle INSERT/UPDATE/DELETE (no rows returned)
            if (sqliteSql.trim().toLowerCase().startsWith('insert') || 
                sqliteSql.trim().toLowerCase().startsWith('update') ||
                sqliteSql.trim().toLowerCase().startsWith('delete')) {
                db.run(sqliteSql, params, function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ 
                            rows: [{ id: this.lastID }],
                            rowCount: this.changes 
                        });
                    }
                });
            } else {
                // Handle SELECT queries
                db.all(sqliteSql, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ rows: rows || [] });
                    }
                });
            }
        });
    }
};

// Initialize tables if they don't exist
db.serialize(() => {
    // Jobs table
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT,
        type TEXT,
        apply_link TEXT,
        criteria TEXT,
        fees_structure TEXT,
        last_date DATE,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Courses table
    db.run(`CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        duration TEXT,
        fees_structure TEXT,
        eligibility TEXT,
        apply_link TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    console.log('Database tables initialized');
});

module.exports = pool;
