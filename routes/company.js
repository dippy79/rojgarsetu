// routes/company.js - Company management routes
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticate, authorize, requireCompanyOwnership } = require('../middleware/auth');

// Get company's own jobs
router.get('/jobs', authenticate, authorize('company', 'admin'), companyController.getCompanyJobs);

// Get applicants for a specific job (company owns the job)
router.get('/jobs/:jobId/applicants', authenticate, authorize('company', 'admin'), requireCompanyOwnership, companyController.getJobApplicants);

// Update applicant status
router.put('/jobs/:jobId/applicants/:applicationId', authenticate, authorize('company', 'admin'), requireCompanyOwnership, companyController.updateApplicantStatus);

// Bulk update applicants
router.post('/jobs/:jobId/applicants/bulk-update', authenticate, authorize('company', 'admin'), requireCompanyOwnership, companyController.bulkUpdateApplicants);

// Get company analytics
router.get('/analytics', authenticate, authorize('company', 'admin'), companyController.getCompanyAnalytics);

module.exports = router;
