// middleware/validation.js - Input validation using express-validator
const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Helper to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors:', errors.array());
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// User registration validation
const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .isIn(['candidate', 'company'])
        .withMessage('Role must be either candidate or company'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),
    handleValidationErrors
];

// User login validation
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Job creation validation
const validateCreateJob = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage('Job title must be between 5 and 255 characters'),
    body('description')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Job description must be at least 50 characters'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    body('type')
        .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
        .withMessage('Invalid job type'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Location must not exceed 255 characters'),
    body('salaryMin')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum salary must be a positive number'),
    body('salaryMax')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum salary must be a positive number'),
    body('lastDate')
        .optional()
        .isISO8601()
        .withMessage('Last date must be a valid date'),
    handleValidationErrors
];

// Job update validation
const validateUpdateJob = [
    param('id')
        .isUUID()
        .withMessage('Invalid job ID'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage('Job title must be between 5 and 255 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 50 })
        .withMessage('Job description must be at least 50 characters'),
    body('type')
        .optional()
        .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
        .withMessage('Invalid job type'),
    handleValidationErrors
];

// Course creation validation
const validateCreateCourse = [
    body('name')
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage('Course name must be between 5 and 255 characters'),
    body('description')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Course description must be at least 50 characters'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    body('duration')
        .trim()
        .notEmpty()
        .withMessage('Duration is required'),
    body('mode')
        .optional()
        .isIn(['online', 'offline', 'hybrid'])
        .withMessage('Mode must be online, offline, or hybrid'),
    body('feesAmount')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Fees amount must be a positive number'),
    handleValidationErrors
];

// Course update validation
const validateUpdateCourse = [
    param('id')
        .isUUID()
        .withMessage('Invalid course ID'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 5, max: 255 })
        .withMessage('Course name must be between 5 and 255 characters'),
    handleValidationErrors
];

// Job application validation
const validateJobApplication = [
    param('jobId')
        .isUUID()
        .withMessage('Invalid job ID'),
    body('coverLetter')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Cover letter must not exceed 2000 characters'),
    handleValidationErrors
];

// Job search/filters validation
const validateJobFilters = [
    query('category')
        .optional()
        .trim(),
    query('type')
        .optional()
        .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote', ''])
        .withMessage('Invalid job type'),
    query('location')
        .optional()
        .trim(),
    query('salaryMin')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum salary must be a positive number'),
    query('salaryMax')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum salary must be a positive number'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive number'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

// Course search/filters validation
const validateCourseFilters = [
    query('category')
        .optional()
        .trim(),
    query('duration')
        .optional()
        .trim(),
    query('mode')
        .optional()
        .isIn(['online', 'offline', 'hybrid', ''])
        .withMessage('Invalid mode'),
    query('feesMin')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum fees must be a positive number'),
    query('feesMax')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum fees must be a positive number'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive number'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

// Company profile validation
const validateCompanyProfile = [
    body('companyName')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Company name must be between 2 and 255 characters'),
    body('description')
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Description must be between 50 and 5000 characters'),
    body('website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL'),
    body('industry')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Industry must not exceed 100 characters'),
    handleValidationErrors
];

// Candidate profile validation
const validateCandidateProfile = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),
    body('phone')
        .optional()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Please provide a valid phone number'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Location must not exceed 255 characters'),
    body('expectedSalaryMin')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Expected salary must be a positive number'),
    body('expectedSalaryMax')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Expected salary must be a positive number'),
    handleValidationErrors
];

// UUID param validation
const validateUUID = (paramName) => [
    param(paramName)
        .isUUID()
        .withMessage(`Invalid ${paramName} format`),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateCreateJob,
    validateUpdateJob,
    validateCreateCourse,
    validateUpdateCourse,
    validateJobApplication,
    validateJobFilters,
    validateCourseFilters,
    validateCompanyProfile,
    validateCandidateProfile,
    validateUUID,
    handleValidationErrors
};
