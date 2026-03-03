// routes/admin.js - Admin Management Routes
const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllJobs,
    updateJob,
    deleteJob,
    getAllCourses,
    updateCourse,
    deleteCourse,
    getAdmins,
    createAdmin,
    updateAdmin,
    getAuditLogs
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/superAdminOnly');
const { handleValidationErrors } = require('../middleware/validation');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin', 'super_admin'));

// ============================================
// DASHBOARD
// ============================================

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// ============================================
// USER MANAGEMENT
// ============================================

// GET /api/admin/users - Get all users
router.get('/users', getUsers);

// GET /api/admin/users/:id - Get user by ID
router.get('/users/:id', getUserById);

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', updateUser);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', deleteUser);

// ============================================
// JOB MANAGEMENT
// ============================================

// GET /api/admin/jobs - Get all jobs
router.get('/jobs', getAllJobs);

// PUT /api/admin/jobs/:id - Update job
router.put('/jobs/:id', updateJob);

// DELETE /api/admin/jobs/:id - Delete job
router.delete('/jobs/:id', deleteJob);

// ============================================
// COURSE MANAGEMENT
// ============================================

// GET /api/admin/courses - Get all courses
router.get('/courses', getAllCourses);

// PUT /api/admin/courses/:id - Update course
router.put('/courses/:id', updateCourse);

// DELETE /api/admin/courses/:id - Delete course
router.delete('/courses/:id', deleteCourse);

// ============================================
// ADMIN PROFILES (Super Admin only)
// ============================================

// GET /api/admin/admins - Get all admins
router.get('/admins', superAdminOnly, getAdmins);

// POST /api/admin/admins - Create new admin
router.post('/admins', superAdminOnly, handleValidationErrors, createAdmin);

// PUT /api/admin/admins/:id - Update admin
router.put('/admins/:id', superAdminOnly, updateAdmin);

// ============================================
// AUDIT LOGS (Super Admin only)
// ============================================

// GET /api/admin/audit-logs - Get audit logs
router.get('/audit-logs', superAdminOnly, getAuditLogs);

module.exports = router;

