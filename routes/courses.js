// routes/courses.js - Courses API routes
const express = require('express');
const router = express.Router();
const { 
    getCourses, 
    getCourseById, 
    addCourse, 
    updateCourse, 
    deleteCourse,
    getCategories,
    getFeaturedCourses,
    searchCourses,
    getSimilarCourses
} = require('../controllers/coursesController');
const { authenticate, authorize, requireCompanyOwnership, optionalAuth } = require('../middleware/auth');
const { 
    validateCreateCourse, 
    validateUpdateCourse, 
    validateCourseFilters,
    validateUUID 
} = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, validateCourseFilters, getCourses);    // GET /courses?category=&mode=&page=&limit=
router.get('/search', optionalAuth, searchCourses);    // GET /courses/search?q=
router.get('/categories', getCategories);    // GET /courses/categories
router.get('/featured', getFeaturedCourses);    // GET /courses/featured?limit=
router.get('/:id/similar', optionalAuth, getSimilarCourses);    // GET /courses/:id/similar

// Protected routes - Company/Admin only
router.post('/', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateCreateCourse, 
    addCourse
);    // POST /courses

router.put('/:id', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateUpdateCourse, 
    updateCourse
);    // PUT /courses/:id

router.delete('/:id', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateUUID('id'),
    deleteCourse
);    // DELETE /courses/:id

// Single course - must be last to avoid conflicts with other routes
router.get('/:id', optionalAuth, getCourseById);    // GET /courses/:id?lang=

module.exports = router;
