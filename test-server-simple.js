// Simple server test
const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
