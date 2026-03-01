// routes/profile.js - Profile routes
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate, authorize } = require('../middleware/auth');

// Candidate routes
router.get('/candidate', authenticate, authorize('candidate'), profileController.getCandidateProfile);
router.put('/candidate', authenticate, authorize('candidate'), profileController.updateCandidateProfile);
router.get('/candidate/dashboard', authenticate, authorize('candidate'), profileController.getCandidateDashboard);

// Company routes
router.get('/company', authenticate, authorize('company'), profileController.getCompanyProfile);
router.put('/company', authenticate, authorize('company'), profileController.updateCompanyProfile);
router.get('/company/dashboard', authenticate, authorize('company'), profileController.getCompanyDashboard);

module.exports = router;
