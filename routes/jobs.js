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
    getGovernmentJobs,
    getPrivateJobs,
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

// Public routes
router.get('/', optionalAuth, validateJobFilters, getJobs);
router.get('/search', optionalAuth, searchJobs);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedJobs);
router.get('/government', optionalAuth, getGovernmentJobs);
router.get('/private', optionalAuth, getPrivateJobs);
router.get('/:id/similar', optionalAuth, getSimilarJobs);

// Protected routes - Company only
router.post('/', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateCreateJob, 
    createJob
);

router.put('/:id', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateUpdateJob, 
    updateJob
);

router.delete('/:id', 
    authenticate, 
    authorize('company', 'admin'), 
    requireCompanyOwnership,
    validateUUID('id'),
    deleteJob
);

// Single job - must be last to avoid conflicts with other routes
router.get('/:id', optionalAuth, getJobById);

module.exports = router;
