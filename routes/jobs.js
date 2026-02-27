const express = require('express');
const router = express.Router();
const { 
    getJobs, 
    getJobById, 
    createJob, 
    updateJob, 
    deleteJob,
    getCategories,
    getFeaturedJobs,
    searchJobs,
    getSimilarJobs
} = require('../controllers/jobsController');
const { authenticate, authorize, requireCompanyOwnership, optionalAuth } = require('../middleware/auth');
const { 
    validateCreateJob, 
    validateUpdateJob, 
    validateJobFilters,
    validateUUID 
} = require('../middleware/validation');
const { jobPostLimiter } = require('../middleware/security');

// Public routes
router.get('/', optionalAuth, validateJobFilters, getJobs);    // GET /jobs?category=&type=&location=&page=&limit=
router.get('/search', optionalAuth, searchJobs);    // GET /jobs/search?q=
router.get('/categories', getCategories);    // GET /jobs/categories
router.get('/featured', getFeaturedJobs);    // GET /jobs/featured?limit=
router.get('/:id/similar', optionalAuth, getSimilarJobs);    // GET /jobs/:id/similar

// Protected routes - Company only
router.post('/', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    jobPostLimiter,
    validateCreateJob, 
    createJob
);    // POST /jobs

router.put('/:id', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateUpdateJob, 
    updateJob
);    // PUT /jobs/:id

router.delete('/:id', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateUUID('id'),
    deleteJob
);    // DELETE /jobs/:id

// Single job - must be last to avoid conflicts with other routes
router.get('/:id', optionalAuth, getJobById);    // GET /jobs/:id?lang=

module.exports = router;
