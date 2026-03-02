// Test loading all routes
require('dotenv').config({ path: '.env' });

console.log('1. Loading express...');
const express = require('express');
const app = express();
app.use(express.json());

console.log('2. Loading auth middleware...');
require('./middleware/auth');

console.log('3. Loading validation middleware...');
require('./middleware/validation');

console.log('4. Loading security middleware...');
require('./middleware/security');

console.log('5. Loading jobs routes...');
try {
    const jobsRoutes = require('./routes/jobs');
    console.log('✓ Jobs routes loaded');
    app.use('/api/jobs', jobsRoutes);
} catch (err) {
    console.error('✗ Jobs routes error:', err.message);
    console.error(err.stack);
    process.exit(1);
}

console.log('6. Loading courses routes...');
try {
    const coursesRoutes = require('./routes/courses');
    console.log('✓ Courses routes loaded');
    app.use('/api/courses', coursesRoutes);
} catch (err) {
    console.error('✗ Courses routes error:', err.message);
    process.exit(1);
}

console.log('7. Loading auth routes...');
try {
    const authRoutes = require('./routes/auth');
    console.log('✓ Auth routes loaded');
    app.use('/api/auth', authRoutes);
} catch (err) {
    console.error('✗ Auth routes error:', err.message);
    process.exit(1);
}

console.log('8. Loading profile routes...');
try {
    const profileRoutes = require('./routes/profile');
    console.log('✓ Profile routes loaded');
    app.use('/api/profile', profileRoutes);
} catch (err) {
    console.error('✗ Profile routes error:', err.message);
    process.exit(1);
}

console.log('9. Loading company routes...');
try {
    const companyRoutes = require('./routes/company');
    console.log('✓ Company routes loaded');
    app.use('/api/company', companyRoutes);
} catch (err) {
    console.error('✗ Company routes error:', err.message);
    process.exit(1);
}

console.log('10. Loading notifications routes...');
try {
    const notificationsRoutes = require('./routes/notifications');
    console.log('✓ Notifications routes loaded');
    app.use('/api/notifications', notificationsRoutes);
} catch (err) {
    console.error('✗ Notifications routes error:', err.message);
    process.exit(1);
}

console.log('\n=== All routes loaded successfully! ===\n');

// Test endpoint
app.get('/api/test', (req, res) => res.json({ success: true }));

app.listen(5002, () => {
    console.log('Server on http://localhost:5002');
});
