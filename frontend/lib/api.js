// frontend/lib/api.js - API utilities for frontend with retry logic
import axios from 'axios';

// Get API base URL - prioritize environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 
                 (typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':5000') : 'http://localhost:5000');

console.log('API Base URL:', API_BASE);

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000 // 15 second timeout
});

// Retry logic configuration
const retryConfig = {
    retries: 2,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => {
        return axios.isAxiosError(error) && 
               !error.response && 
               (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK');
    }
};

// Add token to requests if available
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        
        // Log error for debugging
        console.error('API Error:', error.message, error.config?.url);
        
        return Promise.reject(error);
    }
);

// Retry axios request wrapper
const axiosWithRetry = async (config, retries = 2) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await api(config);
        } catch (error) {
            if (i === retries - 1) throw error;
            if (retryConfig.retryCondition(error)) {
                await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay(i + 1)));
                console.log(`Retrying request to ${config.url}...`);
            } else {
                throw error;
            }
        }
    }
};

// Basic fetcher for SWR with retry
export const fetcher = async (url) => {
    try {
        const response = await axiosWithRetry({ url }, retryConfig.retries);
        return response.data;
    } catch (error) {
        console.error('Fetcher error for', url, error.message);
        throw error;
    }
};

// Auth API
export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    logout: () => api.post('/api/auth/logout'),
    getProfile: () => api.get('/api/auth/profile'),
    updateProfile: (data) => api.put('/api/auth/profile', data),
    refreshToken: () => api.post('/api/auth/refresh')
};

// Jobs API
export const jobsAPI = {
    // Get all jobs with filters
    getJobs: (params) => api.get('/api/jobs', { params }),
    
    // Get single job
    getJob: (id) => api.get(`/api/jobs/${id}`),
    
    // Search jobs
    searchJobs: (q) => api.get('/api/jobs/search', { params: { q } }),
    
    // Get featured jobs
    getFeaturedJobs: (limit = 5) => api.get('/api/jobs/featured', { params: { limit } }),
    
    // Get government jobs
    getGovernmentJobs: (params) => api.get('/api/jobs/government', { params }),
    
    // Get private jobs
    getPrivateJobs: (params) => api.get('/api/jobs/private', { params }),
    
    // Get job categories
    getCategories: () => api.get('/api/jobs/categories'),
    
    // Get similar jobs
    getSimilarJobs: (id) => api.get(`/api/jobs/${id}/similar`),
    
    // Create job (company/admin)
    createJob: (data) => api.post('/api/jobs', data),
    
    // Update job (company/admin)
    updateJob: (id, data) => api.put(`/api/jobs/${id}`, data),
    
    // Delete job (company/admin)
    deleteJob: (id) => api.delete(`/api/jobs/${id}`),
    
    // Save job (candidate)
    saveJob: (jobId) => api.post(`/api/jobs/${jobId}/save`),
    
    // Unsave job (candidate)
    unsaveJob: (jobId) => api.delete(`/api/jobs/${jobId}/save`),
    
    // Get saved jobs (candidate)
    getSavedJobs: (params) => api.get('/api/jobs/saved', { params }),
    
    // Apply to job (candidate)
    applyToJob: (jobId, data) => api.post(`/api/jobs/${jobId}/apply`, data),
    
    // Withdraw application (candidate)
    withdrawApplication: (jobId) => api.delete(`/api/jobs/${jobId}/apply`),
    
    // Get my applications (candidate)
    getMyApplications: (params) => api.get('/api/jobs/applications', { params }),
    
    // Get single application (candidate)
    getMyApplication: (id) => api.get(`/api/jobs/applications/${id}`)
};

// Courses API
export const coursesAPI = {
    // Get all courses with filters
    getCourses: (params) => api.get('/api/courses', { params }),
    
    // Get single course
    getCourse: (id) => api.get(`/api/courses/${id}`),
    
    // Search courses
    searchCourses: (q) => api.get('/api/courses/search', { params: { q } }),
    
    // Get featured courses
    getFeaturedCourses: (limit = 5) => api.get('/api/courses/featured', { params: { limit } }),
    
    // Get course categories
    getCategories: () => api.get('/api/courses/categories'),
    
    // Get similar courses
    getSimilarCourses: (id) => api.get(`/api/courses/${id}/similar`),
    
    // Create course (company/admin)
    createCourse: (data) => api.post('/api/courses', data),
    
    // Update course (company/admin)
    updateCourse: (id, data) => api.put(`/api/courses/${id}`, data),
    
    // Delete course (company/admin)
    deleteCourse: (id) => api.delete(`/api/courses/${id}`)
};

// Companies API
export const companiesAPI = {
    // Get all companies
    getCompanies: (params) => api.get('/api/companies', { params }),
    
    // Get single company
    getCompany: (id) => api.get(`/api/companies/${id}`),
    
    // Get company jobs
    getCompanyJobs: (id) => api.get(`/api/companies/${id}/jobs`),
    
    // Get company courses
    getCompanyCourses: (id) => api.get(`/api/companies/${id}/courses`),
    
    // Update company (company admin)
    updateCompany: (id, data) => api.put(`/api/companies/${id}`, data),
    
    // Get company applicants (company admin)
    getCompanyApplicants: (companyId, params) => api.get(`/api/companies/${companyId}/applicants`, { params }),
    
    // Update applicant status (company admin)
    updateApplicantStatus: (companyId, applicationId, status) => 
        api.put(`/api/companies/${companyId}/applicants/${applicationId}`, { status })
};

// Applications API
export const applicationsAPI = {
    // Get all applications (admin/company)
    getApplications: (params) => api.get('/api/applications', { params }),
    
    // Get single application
    getApplication: (id) => api.get(`/api/applications/${id}`),
    
    // Update application status
    updateApplication: (id, status, notes) => api.put(`/api/applications/${id}`, { status, notes })
};

// Notifications API
export const notificationsAPI = {
    // Get my notifications
    getNotifications: (params) => api.get('/api/notifications', { params }),
    
    // Mark notification as read
    markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
    
    // Mark all as read
    markAllAsRead: () => api.put('/api/notifications/read-all'),
    
    // Delete notification
    deleteNotification: (id) => api.delete(`/api/notifications/${id}`),
    
    // Get unread count
    getUnreadCount: () => api.get('/api/notifications/unread-count'),
    
    // Get preferences
    getPreferences: () => api.get('/api/notifications/preferences'),
    
    // Update preferences
    updatePreferences: (data) => api.put('/api/notifications/preferences', data)
};

// Profile API
export const profileAPI = {
    // Get candidate profile
    getCandidateProfile: () => api.get('/api/profile/candidate'),
    
    // Update candidate profile
    updateCandidateProfile: (data) => api.put('/api/profile/candidate', data),
    
    // Get candidate dashboard
    getCandidateDashboard: () => api.get('/api/profile/candidate/dashboard'),
    
    // Get company profile
    getCompanyProfile: () => api.get('/api/profile/company'),
    
    // Update company profile
    updateCompanyProfile: (data) => api.put('/api/profile/company', data),
    
    // Get company dashboard
    getCompanyDashboard: () => api.get('/api/profile/company/dashboard')
};

// Company Management API
export const companyAPI = {
    // Get company's jobs
    getCompanyJobs: (params) => api.get('/api/company/jobs', { params }),
    
    // Get applicants for a job
    getJobApplicants: (jobId, params) => api.get(`/api/company/jobs/${jobId}/applicants`, { params }),
    
    // Update applicant status
    updateApplicantStatus: (jobId, applicationId, data) => 
        api.put(`/api/company/jobs/${jobId}/applicants/${applicationId}`, data),
    
    // Bulk update applicants
    bulkUpdateApplicants: (jobId, data) => 
        api.post(`/api/company/jobs/${jobId}/applicants/bulk-update`, data),
    
    // Get company analytics
    getCompanyAnalytics: (params) => api.get('/api/company/analytics', { params })
};

export default api;
