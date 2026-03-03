// frontend/pages/courses/index.js - Courses listing page with dark glassmorphism design
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { coursesAPI } from '../../lib/api';

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
function CourseCardSkeleton() {
    return (
        <div className="course-card">
            <div className="skeleton" style={{ width: '80px', height: '24px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '24px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '40px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '120px', height: '40px' }} />
        </div>
    );
}

// Course card component with glassmorphism
function CourseCard({ course, index }) {
    const formatFees = (fees) => {
        if (!fees || fees === '0' || fees.toLowerCase() === 'free') return 'Free';
        return '₹' + fees;
    };

    return (
        <motion.div 
            className="course-card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: index * 0.1 }}
        >
            <div className="course-card-header">
                <span 
                    className="badge"
                    style={{ 
                        backgroundColor: '#14B8A620', 
                        color: '#5EEAD4' 
                    }}
                >
                    {course.category}
                </span>
                {course.is_featured && (
                    <span className="badge badge-featured">Popular</span>
                )}
            </div>
            
            <h3>
                <Link href={`/courses/${course.id}`}>
                    {course.title}
                </Link>
            </h3>
            
            <p className="course-provider">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                {course.provider || 'RojgarSetu'}
            </p>
            
            <div className="course-meta">
                <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    {course.duration || 'Self-paced'}
                </span>
                {course.fees && (
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        {formatFees(course.fees)}
                    </span>
                )}
            </div>
            
            {course.description && (
                <p className="course-description">
                    {course.description.substring(0, 100)}...
                </p>
            )}
            
            <Link href={`/courses/${course.id}`} className="apply-link">
                View Details
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12,5 19,12 12,19"/>
                </svg>
            </Link>
        </motion.div>
    );
}

// Filter sidebar component with glassmorphism
function FilterSidebar({ filters, setFilters, categories }) {
    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <div className="filter-sidebar">
            <div className="filter-section">
                <h4>Search</h4>
                <input
                    type="text"
                    placeholder="Search courses..."
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

            <button 
                className="clear-filters-btn"
                onClick={() => setFilters({
                    search: '',
                    category: '',
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

// Main Courses page component
export default function CoursesPage() {
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        page: 1,
        limit: 12
    });

    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category) queryParams.append('category', filters.category);
    queryParams.append('page', filters.page);
    queryParams.append('limit', filters.limit);

    // Fetch courses with filters
    const { data: coursesData, error: coursesError, isLoading } = useSWR(
        `/api/courses?${queryParams.toString()}`,
        fetcher,
        { 
            revalidateOnFocus: false,
            dedupingInterval: 5000
        }
    );

    // Fetch categories
    const { data: categoriesData } = useSWR(
        '/api/courses/categories',
        fetcher,
        { revalidateOnFocus: false }
    );

    const categories = categoriesData?.data || [];
    const courses = coursesData?.data || [];
    const pagination = coursesData?.pagination || { page: 1, limit: 12, totalCount: 0, totalPages: 0 };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="courses-page">
            {/* Hero Section */}
            <section className="hero-small">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Upskill with Our Courses</h1>
                    <p>Learn from industry experts and boost your career</p>
                </motion.div>
            </section>

            <div className="courses-container">
                <aside className="courses-sidebar">
                    <FilterSidebar 
                        filters={filters} 
                        setFilters={setFilters}
                        categories={categories}
                    />
                </aside>
                
                <main className="courses-main">
                    <div className="courses-header">
                        <h2>{pagination.totalCount} courses available</h2>
                        <div className="results-info">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>
                    </div>

                    {coursesError && (
                        <div className="error-fallback">
                            <h3>Unable to load courses</h3>
                            <p>Please try again later.</p>
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    )}

                    {isLoading ? (
                        <motion.div 
                            className="courses-grid"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                        >
                            {[...Array(6)].map((_, i) => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </motion.div>
                    ) : courses.length === 0 ? (
                        <motion.div 
                            className="empty-state"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
                            <div className="empty-state-icon">📚</div>
                            <h3>No courses found</h3>
                            <p>Try adjusting your filters or search criteria</p>
                            <button 
                                onClick={() => setFilters({
                                    search: '',
                                    category: '',
                                    page: 1
                                })}
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <motion.div 
                                className="courses-grid"
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                {courses.map((course, index) => (
                                    <CourseCard key={course.id} course={course} index={index} />
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
                .courses-page {
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
                        radial-gradient(circle at 30% 30%, rgba(20, 184, 166, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at 70% 70%, rgba(124, 58, 237, 0.1) 0%, transparent 40%);
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
                    background: linear-gradient(135deg, var(--text-primary) 0%, var(--color-secondary-light) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-content p {
                    color: var(--text-secondary);
                    font-size: 1.125rem;
                }

                .courses-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 32px 20px;
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 32px;
                }

                @media (max-width: 1024px) {
                    .courses-container {
                        grid-template-columns: 1fr;
                    }
                }

                .courses-sidebar {
                    position: sticky;
                    top: 100px;
                    height: fit-content;
                }

                .courses-main {
                    min-width: 0;
                }

                .courses-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .courses-header h2 {
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
                    border-color: var(--color-secondary);
                    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
                }

                .filter-input::placeholder {
                    color: var(--text-tertiary);
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
                    border-color: var(--color-secondary);
                }

                /* Courses Grid */
                .courses-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                /* Course Card with Glassmorphism */
                .course-card {
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

                .course-card:hover {
                    transform: translateY(-6px);
                    box-shadow: var(--shadow-xl), 0 0 30px rgba(20, 184, 166, 0.15);
                    border-color: rgba(20, 184, 166, 0.2);
                }

                .course-card-header {
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
                    background: rgba(20, 184, 166, 0.15);
                    color: var(--color-secondary-light);
                }

                .badge-featured {
                    background: rgba(245, 158, 11, 0.15);
                    color: #F59E0B;
                }

                .course-card h3 {
                    font-size: 1.125rem;
                    margin-bottom: 8px;
                    color: var(--text-primary);
                }

                .course-card h3 a {
                    color: var(--text-primary);
                    text-decoration: none;
                    transition: color var(--transition-fast);
                }

                .course-card h3 a:hover {
                    color: var(--color-secondary-light);
                }

                .course-provider {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .course-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    color: var(--text-tertiary);
                    font-size: 0.8125rem;
                    margin-bottom: 16px;
                }

                .course-meta span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .course-description {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    line-height: 1.5;
                    margin-bottom: 16px;
                }

                .apply-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: var(--gradient-secondary);
                    color: white;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    font-size: 0.875rem;
                    text-decoration: none;
                    margin-top: auto;
                    transition: all var(--transition-normal);
                    box-shadow: var(--shadow-md);
                }

                .apply-link:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg), var(--shadow-glow-secondary);
                    color: white;
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
                    background: var(--gradient-secondary);
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
                    box-shadow: var(--shadow-glow-secondary);
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
                    background: rgba(20, 184, 166, 0.1);
                    border-color: var(--color-secondary);
                    color: var(--text-primary);
                }

                .page-num.active {
                    background: var(--gradient-secondary);
                    border-color: var(--color-secondary);
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
                    background: var(--gradient-secondary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .empty-state button:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow-secondary);
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

                    .courses-header {
                        flex-direction: column;
                        gap: 8px;
                    }

                    .courses-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

