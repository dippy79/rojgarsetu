// routes/applications.js - Application Tracking Routes
const express = require('express');
const router = express.Router();
const {
    getMyApplications,
    getMyApplication,
    applyToJob,
    withdrawApplication,
    getJobApplications,
    updateApplicationStatus,
    getApplicationStats
} = require('../controllers/applicationsController');
const { authenticate, authorize, requireCandidateProfile, requireCompanyOwnership } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// ============================================
// CANDIDATE ROUTES
// ============================================

// All candidate routes require authentication
router.use(authenticate);

// GET /api/applications - Get my applications
router.get('/', 
    authorize('candidate'), 
    requireCandidateProfile,
    getMyApplications
);

// GET /api/applications/:id - Get single application
router.get('/:id', 
    authorize('candidate'), 
    requireCandidateProfile,
    getMyApplication
);

// POST /api/applications/:jobId - Apply to a job
router.post('/:jobId', 
    authorize('candidate'), 
    requireCandidateProfile,
    handleValidationErrors,
    applyToJob
);

// DELETE /api/applications/:jobId - Withdraw application
router.delete('/:jobId', 
    authorize('candidate'), 
    requireCandidateProfile,
    withdrawApplication
);

// ============================================
// COMPANY/ADMIN ROUTES
// ============================================

// GET /api/applications/job/:jobId - Get applications for a job
router.get('/job/:jobId', 
    authenticate, 
    authorize('company', 'admin', 'super_admin'),
    getJobApplications
);

// PUT /api/applications/:applicationId - Update application status
router.put('/:applicationId', 
    authenticate, 
    authorize('company', 'admin', 'super_admin'),
    updateApplicationStatus
);

// GET /api/applications/stats - Get application statistics
router.get('/stats/all', 
    authenticate, 
    authorize('company', 'admin', 'super_admin'),
    getApplicationStats
);

module.exports = router;

