// frontend/pages/jobs/index.js - Jobs listing page with dark glassmorphism design
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { jobsAPI } from '../../lib/api';
import { theme, getBadgeColor } from '../../styles/theme';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: { 
        y: -6,
        transition: { duration: 0.2 }
    }
};

// Loading skeleton component
function JobCardSkeleton() {
    return (
        <div className="job-card">
            <div className="skeleton" style={{ width: '80px', height: '24px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '24px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '120px', height: '40px' }} />
        </div>
    );
}

// Job card component with glassmorphism
function JobCard({ job, index }) {
    const badgeColor = getBadgeColor(job.category);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getDaysLeft = (dateStr) => {
        if (!dateStr) return null;
        const lastDate = new Date(dateStr);
        const today = new Date();
        const diffTime = lastDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysLeft = getDaysLeft(job.last_date);
    const isExpired = daysLeft !== null && daysLeft <= 0;

    return (
        <motion.div 
            className="job-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.1 }}
        >
            <div className="job-card-header">
                <span 
                    className="badge" 
                    style={{ 
                        backgroundColor: `${badgeColor}20`, 
                        color: badgeColor 
                    }}
                >
                    {job.category}
                </span>
                {job.is_featured && (
                    <span className="badge badge-featured">Featured</span>
                )}
                {job.is_government && (
                    <span className="badge badge-government">Government</span>
                )}
            </div>
            
            <h3>
                <Link href={`/jobs/${job.id}`}>
                    {job.title}
                </Link>
            </h3>
            
            <p className="job-company">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                {job.organization || job.company || job.source || 'RojgarSetu'}
            </p>
            
            <div className="job-meta">
                <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {job.location || 'All India'}
                </span>
                {job.salary && (
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        {job.salary}
                    </span>
                )}
                {job.type && (
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                        </svg>
                        {job.type === 'full-time' ? 'Full Time' : job.type === 'part-time' ? 'Part Time' : job.type}
                    </span>
                )}
            </div>
            
            {job.last_date && !isExpired && (
                <p className="job-deadline" style={{ color: daysLeft < 7 ? '#EF4444' : daysLeft < 30 ? '#F59E0B' : '#10B981' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    Apply by: {formatDate(job.last_date)} ({daysLeft} days left)
                </p>
            )}
            
            {isExpired && (
                <p className="job-deadline expired">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Expired
                </p>
            )}
            
            <Link href={`/jobs/${job.id}`} className="apply-link">
                View Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                </svg>
            </Link>
            
            {job.apply_link ? (
                <a 
                    href={job.apply_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="apply-btn"
                >
                    Apply Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                    </svg>
                </a>
            ) : (
                <button 
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    className="apply-btn"
                >
                    Apply Now
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                    </svg>
                </button>
            )}
        </motion.div>
    );
}

// Filter sidebar component with glassmorphism
function FilterSidebar({ filters, setFilters, categories, jobTypes }) {
    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <div className="filter-sidebar">
            <div className="filter-section">
                <h4>Search</h4>
                <input
                    type="text"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className="filter-input"
                />
            </div>

            <div className="filter-section">
                <h4>Category</h4>
                <select
                    value={filters.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    {categories?.map(cat => (
                        <option key={cat.category} value={cat.category}>{cat.category} ({cat.count})</option>
                    ))}
                </select>
            </div>

            <div className="filter-section">
                <h4>Job Type</h4>
                <div className="filter-options">
                    {jobTypes?.map(type => (
                        <label key={type.value} className="filter-checkbox">
                            <input
                                type="checkbox"
                                checked={filters.type === type.value}
                                onChange={() => handleChange('type', filters.type === type.value ? '' : type.value)}
                            />
                            <span>{type.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="filter-section">
                <h4>Location</h4>
                <input
                    type="text"
                    placeholder="Enter location..."
                    value={filters.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="filter-input"
                />
            </div>

            <button 
                className="clear-filters-btn"
                onClick={() => setFilters({
                    search: '',
                    category: '',
                    type: '',
                    location: '',
                    page: 1
                })}
            >
                Clear All Filters
            </button>
        </div>
    );
}

// Fetcher function
const fetcher = (url) => fetch(url).then((res) => res.json());

// Main Jobs page component
export default function JobsPage() {
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        type: '',
        location: '',
        page: 1,
        limit: 12
    });

    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.location) queryParams.append('location', filters.location);
    queryParams.append('page', filters.page);
    queryParams.append('limit', filters.limit);

    // Fetch jobs with filters
    const { data: jobsData, error: jobsError, isLoading } = useSWR(
        `/api/jobs?${queryParams.toString()}`,
        fetcher,
        { 
            revalidateOnFocus: false,
            dedupingInterval: 5000
        }
    );

    // Fetch categories
    const { data: categoriesData } = useSWR(
        '/api/jobs/categories',
        fetcher,
        { revalidateOnFocus: false }
    );

    const categories = categoriesData?.data || [];
    const jobs = jobsData?.data || [];
    const pagination = jobsData?.pagination || { page: 1, limit: 12, totalCount: 0, totalPages: 0 };

    const jobTypes = [
        { value: 'full-time', label: 'Full Time' },
        { value: 'part-time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'internship', label: 'Internship' }
    ];

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="jobs-page">
            {/* Hero Section */}
            <section className="hero-small">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Find Your Dream Job</h1>
                    <p>Browse thousands of government and private job opportunities</p>
                </motion.div>
            </section>

            <div className="jobs-container">
                <aside className="jobs-sidebar">
                    <FilterSidebar 
                        filters={filters} 
                        setFilters={setFilters}
                        categories={categories}
                        jobTypes={jobTypes}
                    />
                </aside>
                
                <main className="jobs-main">
                    <div className="jobs-header">
                        <h2>{pagination.totalCount} jobs available</h2>
                        <div className="results-info">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>
                    </div>

                    {jobsError && (
                        <div className="error-fallback">
                            <h3>Unable to load jobs</h3>
                            <p>Please try again later.</p>
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    )}

                    {isLoading ? (
                        <motion.div 
                            className="jobs-grid"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {[...Array(6)].map((_, i) => (
                                <JobCardSkeleton key={i} />
                            ))}
                        </motion.div>
                    ) : jobs.length === 0 ? (
                        <motion.div 
                            className="empty-state"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="empty-state-icon">📭</div>
                            <h3>No jobs found</h3>
                            <p>Try adjusting your filters or search criteria</p>
                            <button 
                                onClick={() => setFilters({
                                    search: '',
                                    category: '',
                                    type: '',
                                    location: '',
                                    page: 1
                                })}
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div 
                                className="jobs-grid"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                {jobs.map((job, index) => (
                                    <JobCard key={job.id} job={job} index={index} />
                                ))}
                            </motion.div>

                            {pagination.totalPages > 1 && (
                                <motion.div 
                                    className="pagination"
                                    variants={fadeInUp}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <button
                                        disabled={pagination.page <= 1}
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        className="page-btn"
                                    >
                                        Previous
                                    </button>
                                    
                                    <div className="page-numbers">
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (pagination.totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (pagination.page <= 3) {
                                                pageNum = i + 1;
                                            } else if (pagination.page >= pagination.totalPages - 2) {
                                                pageNum = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNum = pagination.page - 2 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`page-num ${pagination.page === pageNum ? 'active' : ''}`}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    <button
                                        disabled={pagination.page >= pagination.totalPages}
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        className="page-btn"
                                    >
                                        Next
                                    </button>
                                </motion.div>
                            )}
                        </>
                    )}
                </main>
            </div>

            <style jsx>{`
                .jobs-page {
                    min-height: 100vh;
                    background: var(--bg-primary);
                }

                .hero-small {
                    padding: 80px 20px 40px;
                    background: var(--gradient-hero);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .hero-small::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: 
                        radial-gradient(circle at 30% 30%, rgba(124, 58, 237, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at 70% 70%, rgba(20, 184, 166, 0.1) 0%, transparent 40%);
                    animation: heroGlow 15s ease-in-out infinite;
                }

                @keyframes heroGlow {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-5%, -5%) rotate(5deg); }
                }

                .hero-content {
                    position: relative;
                    z-index: 1;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .hero-content h1 {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                    background: linear-gradient(135deg, var(--text-primary) 0%, var(--color-primary-light) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-content p {
                    color: var(--text-secondary);
                    font-size: 1.125rem;
                }

                .jobs-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 32px 20px;
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 32px;
                }

                @media (max-width: 1024px) {
                    .jobs-container {
                        grid-template-columns: 1fr;
                    }
                }

                .jobs-sidebar {
                    position: sticky;
                    top: 100px;
                    height: fit-content;
                }

                .jobs-main {
                    min-width: 0;
                }

                .jobs-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .jobs-header h2 {
                    font-size: 1.5rem;
                    color: var(--text-primary);
                }

                .results-info {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                /* Glassmorphism Filter Sidebar */
                .filter-sidebar {
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-xl);
                    padding: var(--space-lg);
                }

                .filter-section {
                    margin-bottom: 24px;
                }

                .filter-section h4 {
                    margin: 0 0 12px 0;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .filter-input, .filter-select {
                    width: 100%;
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    transition: all var(--transition-fast);
                }

                .filter-input:focus, .filter-select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
                }

                .filter-input::placeholder {
                    color: var(--text-tertiary);
                }

                .filter-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .filter-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    transition: color var(--transition-fast);
                }

                .filter-checkbox:hover {
                    color: var(--text-primary);
                }

                .filter-checkbox input {
                    width: 18px;
                    height: 18px;
                    accent-color: var(--color-primary);
                }

                .clear-filters-btn {
                    width: 100%;
                    padding: 12px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all var(--transition-fast);
                }

                .clear-filters-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary);
                    border-color: var(--color-primary);
                }

                /* Jobs Grid */
                .jobs-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                /* Job Card with Glassmorphism */
                .job-card {
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-xl);
                    padding: var(--space-lg);
                    transition: all var(--transition-normal);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .job-card:hover {
                    transform: translateY(-6px);
                    box-shadow: var(--shadow-xl), 0 0 30px rgba(124, 58, 237, 0.15);
                    border-color: rgba(124, 58, 237, 0.2);
                }

                .job-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 4px 10px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    border-radius: var(--radius-full);
                    background: rgba(124, 58, 237, 0.15);
                    color: var(--color-primary-light);
                }

                .badge-featured {
                    background: rgba(245, 158, 11, 0.15);
                    color: #F59E0B;
                }

                .badge-government {
                    background: rgba(167, 139, 250, 0.15);
                    color: #A78BFA;
                }

                .job-card h3 {
                    font-size: 1.125rem;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .job-card h3 a {
                    color: var(--text-primary);
                    text-decoration: none;
                    transition: color var(--transition-fast);
                }

                .job-card h3 a:hover {
                    color: var(--color-primary-light);
                }

                .job-company {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .job-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    color: var(--text-tertiary);
                    font-size: 0.8125rem;
                    margin-bottom: 16px;
                }

                .job-meta span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .job-deadline {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8125rem;
                    margin-bottom: 16px;
                    font-weight: 500;
                }

                .job-deadline.expired {
                    color: var(--accent-error);
                }

                .apply-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: transparent;
                    color: ${theme.colors.primary};
                    border: 2px solid ${theme.colors.primary};
                    border-radius: ${theme.borderRadius.md};
                    font-weight: 500;
                    font-size: 0.875rem;
                    text-decoration: none;
                    transition: all var(--transition-normal);
                }

                .apply-link:hover {
                    background: ${theme.colors.primary};
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
                }

                .apply-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${theme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${theme.borderRadius.md};
                    font-weight: 500;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    margin-top: 12px;
                }

                .apply-btn:hover {
                    background: ${theme.colors.primaryDark};
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
                }

                /* Pagination */
                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    margin-top: 40px;
                    padding: 20px;
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border-radius: var(--radius-xl);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .page-btn {
                    padding: 10px 20px;
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all var(--transition-fast);
                }

                .page-btn:disabled {
                    background: var(--bg-tertiary);
                    color: var(--text-tertiary);
                    cursor: not-allowed;
                }

                .page-btn:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow-primary);
                }

                .page-numbers {
                    display: flex;
                    gap: 8px;
                }

                .page-num {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .page-num:hover {
                    background: rgba(124, 58, 237, 0.1);
                    border-color: var(--color-primary);
                    color: var(--text-primary);
                }

                .page-num.active {
                    background: var(--gradient-primary);
                    border-color: var(--color-primary);
                    color: white;
                }

                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 80px 24px;
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-xl);
                }

                .empty-state-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .empty-state h3 {
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }

                .empty-state p {
                    color: var(--text-tertiary);
                    margin-bottom: 24px;
                }

                .empty-state button, .error-fallback button {
                    padding: 12px 24px;
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .empty-state button:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow-primary);
                }

                /* Error Fallback */
                .error-fallback {
                    text-align: center;
                    padding: 48px 24px;
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: var(--radius-xl);
                }

                .error-fallback h3 {
                    color: var(--accent-error);
                    margin-bottom: 8px;
                }

                .error-fallback p {
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                }

                /* Skeleton */
                .skeleton {
                    background: linear-gradient(90deg, 
                        var(--bg-tertiary) 25%, 
                        var(--bg-secondary) 50%, 
                        var(--bg-tertiary) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: var(--radius-md);
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .hero-content h1 {
                        font-size: 2rem;
                    }

                    .jobs-header {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .jobs-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

