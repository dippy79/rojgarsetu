// utils/helpers.js - Reusable utility functions

/**
 * Format date to Indian locale string
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
function formatDate(date, options = {}) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const defaultOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options
    };
    
    return dateObj.toLocaleDateString('en-IN', defaultOptions);
}

/**
 * Calculate days remaining until a date
 * @param {string|Date} date - Target date
 * @returns {number|null} Days remaining (negative if past)
 */
function getDaysRemaining(date) {
    if (!date) return null;
    
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

/**
 * Check if a date is expired
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if expired
 */
function isExpired(date) {
    if (!date) return false;
    return getDaysRemaining(date) <= 0;
}

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} totalCount - Total number of items
 * @returns {object} Pagination object
 */
function paginate(page, limit, totalCount) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const total = parseInt(totalCount) || 0;
    
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    
    return {
        page: pageNum,
        limit: limitNum,
        totalCount: total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        offset
    };
}

/**
 * Sanitize string for safe SQL/LIKE query
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeForLike(str) {
    if (!str) return '';
    return str.replace(/[%_]/g, '\\$&');
}

/**
 * Generate slug from string
 * @param {string} str - String to convert to slug
 * @returns {string} URL-friendly slug
 */
function slugify(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Truncate string to specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, length = 100) {
    if (!str || str.length <= length) return str;
    return str.substring(0, length).trim() + '...';
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and errors
 */
function validatePassword(password) {
    const errors = [];
    
    if (!password) {
        return { isValid: false, errors: ['Password is required'] };
    }
    
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Mask sensitive data for logging
 * @param {object} obj - Object to mask
 * @param {string[]} fields - Fields to mask
 * @returns {object} Masked object
 */
function maskSensitiveData(obj, fields = ['password', 'token', 'secret', 'key']) {
    if (!obj) return obj;
    
    const masked = { ...obj };
    
    for (const field of fields) {
        if (masked[field]) {
            masked[field] = '***MASKED***';
        }
    }
    
    return masked;
}

/**
 * Parse query parameters for filtering
 * @param {object} query - Express query object
 * @param {string[]} allowedParams - Allowed parameter names
 * @returns {object} Filtered and sanitized parameters
 */
function parseFilterParams(query, allowedParams = []) {
    const filters = {};
    
    for (const param of allowedParams) {
        if (query[param] !== undefined && query[param] !== '') {
            filters[param] = query[param];
        }
    }
    
    return filters;
}

/**
 * Format file size to human readable
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get error message from various error types
 * @param {Error} error - Error object
 * @returns {string} Error message
 */
function getErrorMessage(error) {
    if (!error) return 'Unknown error';
    
    if (typeof error === 'string') return error;
    
    return error.message || 'An error occurred';
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

module.exports = {
    formatDate,
    getDaysRemaining,
    isExpired,
    paginate,
    sanitizeForLike,
    slugify,
    truncate,
    isValidEmail,
    validatePassword,
    generateRandomString,
    maskSensitiveData,
    parseFilterParams,
    formatFileSize,
    getErrorMessage,
    sleep,
    debounce
};

