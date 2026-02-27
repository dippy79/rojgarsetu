// middleware/upload.js - File upload middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
const certificatesDir = path.join(uploadsDir, 'certificates');

[uploadsDir, resumesDir, certificatesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'resume') {
            cb(null, resumesDir);
        } else if (file.fieldname === 'certificate') {
            cb(null, certificatesDir);
        } else {
            cb(null, uploadsDir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'resume') {
        // Allow PDF and DOC/DOCX
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || 
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOC/DOCX files are allowed for resumes'), false);
        }
    } else if (file.fieldname === 'certificate') {
        // Allow PDF, JPG, PNG
        const allowedTypes = /pdf|jpe?g|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, and PNG files are allowed for certificates'), false);
        }
    } else {
        cb(null, true);
    }
};

// Create multer upload instances
const uploadResume = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || 
            file.mimetype === 'application/msword' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOC/DOCX files are allowed'), false);
        }
    }
});

const uploadCertificate = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpe?g|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
        }
    }
});

module.exports = {
    uploadResume,
    uploadCertificate
};
