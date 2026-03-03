// routes/recommendations.js - Job Recommendations Routes
const express = require('express');
const router = express.Router();
const {
    getJobRecommendations,
    updateRecommendationFeedback,
    getRecommendationAnalytics,
    getRecommendationStats
} = require('../controllers/recommendationsController');
const { authenticate, authorize, requireCandidateProfile } = require('../middleware/auth');

// ============================================
// CANDIDATE ROUTES
// ============================================

// All routes require authentication
router.use(authenticate);

// GET /api/recommendations - Get personalized job recommendations
router.get('/', 
    authorize('candidate'), 
    requireCandidateProfile,
    getJobRecommendations
);

// PUT /api/recommendations/:jobId/feedback - Update recommendation feedback
router.put('/:jobId/feedback', 
    authorize('candidate'), 
    requireCandidateProfile,
    updateRecommendationFeedback
);

// GET /api/recommendations/analytics - Get my recommendation analytics
router.get('/analytics', 
    authorize('candidate'), 
    requireCandidateProfile,
    getRecommendationAnalytics
);

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/recommendations/stats - Get recommendation performance stats
router.get('/stats', 
    authenticate, 
    authorize('admin', 'super_admin'),
    getRecommendationStats
);

module.exports = router;

