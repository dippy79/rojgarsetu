// routes/resumes.js - Resume Management Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { 
    getResumes, 
    getResumeById, 
    uploadResume, 
    updateResume, 
    deleteResume,
    downloadResume 
} = require('../controllers/resumesController');
const { authenticate, requireCandidateProfile } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF and DOC files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// All routes require authentication and candidate profile
router.use(authenticate);
router.use(requireCandidateProfile);

// Public routes (candidate's own resumes)
// GET /api/resumes - Get all resumes
router.get('/', getResumes);

// GET /api/resumes/:id - Get single resume
router.get('/:id', getResumeById);

// GET /api/resumes/:id/download - Download resume
router.get('/:id/download', downloadResume);

// POST /api/resumes - Upload new resume
router.post('/', 
    upload.single('resume'), 
    handleValidationErrors, 
    uploadResume
);

// PUT /api/resumes/:id - Update resume
router.put('/:id', updateResume);

// DELETE /api/resumes/:id - Delete resume
router.delete('/:id', deleteResume);

module.exports = router;

