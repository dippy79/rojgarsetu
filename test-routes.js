const express = require('express');
const app = express();

// Test loading all routes
try {
  const jobsRoutes = require('./routes/jobs');
  const coursesRoutes = require('./routes/courses');
  const authRoutes = require('./routes/auth');
  const profileRoutes = require('./routes/profile');
  const companyRoutes = require('./routes/company');
  const notificationsRoutes = require('./routes/notifications');
  
  console.log('✓ All routes loaded successfully!');
  console.log('  - jobsRoutes: OK');
  console.log('  - coursesRoutes: OK');
  console.log('  - authRoutes: OK');
  console.log('  - profileRoutes: OK');
  console.log('  - companyRoutes: OK');
  console.log('  - notificationsRoutes: OK');
} catch (err) {
  console.error('✗ Route loading failed:', err.message);
  process.exit(1);
}
