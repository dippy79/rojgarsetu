// frontend/pages/saved/index.js - Saved Jobs Page with dark glassmorphism design
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { jobsAPI } from '../../lib/api';

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

// Fetcher function
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SavedJobs() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/jobs/saved',
        () => jobsAPI.getSavedJobs().then(res => res.data),
        { revalidateOnFocus: false }
    );

    const handleUnsave = async (jobId) => {
        if (!confirm('Are you sure you want to remove this job from saved?')) return;
        
        try {
            await jobsAPI.unsaveJob(jobId);
            mutate();
        } catch (err) {
            console.error('Failed to unsave job:', err);
        }
    };

    const jobs = data?.data || [];

    return (
        <div className="saved-page">
            {/* Hero Section */}
            <section className="hero-small">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Saved Jobs</h1>
                    <p>Jobs you've bookmarked for later</p>
                </motion.div>
            </section>

            <div className="saved-container">
                {error && (
                    <div className="error-fallback">
                        <h3>Unable to load saved jobs</h3>
                        <p>Please try again later.</p>
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                )}

                {isLoading ? (
                    <motion.div 
                        className="jobs-list"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="job-card-skeleton">
                                <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '8px' }} />
                                <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '16px' }} />
                                <div className="skeleton" style={{ width: '80%', height: '40px' }} />
                            </div>
                        ))}
                    </motion.div>
                ) : jobs.length === 0 ? (
                    <motion.div 
                        className="empty-state"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="empty-state-icon">⭐</div>
                        <h3>No saved jobs</h3>
                        <p>Save jobs you're interested in to view them here</p>
                        <Link href="/jobs" className="browse-btn">
                            Browse Jobs
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="jobs-list"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {jobs.map((job, index) => (
                            <motion.div 
                                key={job.id} 
                                className="job-card"
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="job-main">
                                    <div className="job-card-header">
                                        <span className="badge">{job.category || 'Job'}</span>
                                        {job.is_featured && <span className="badge badge-featured">Featured</span>}
                                    </div>
                                    
                                    <h3>
                                        <Link href={`/jobs/${job.id}`}>
                                            {job.title}
                                        </Link>
                                    </h3>
                                    
                                    <p className="company-name">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                            <polyline points="9,22 9,12 15,12 15,22"/>
                                        </svg>
                                        {job.company_name || job.organization || job.source || 'Company'}
                                    </p>
                                    
                                    <div className="job-meta">
                                        <span>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                <circle cx="12" cy="10" r="3"/>
                                            </svg>
                                            {job.location || 'All India'}
                                        </span>
                                        {job.type && (
                                            <span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                                </svg>
                                                {job.type}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {job.last_date && (
                                        <p className="deadline">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12,6 12,12 16,14"/>
                                            </svg>
                                            Last date: {new Date(job.last_date).toLocaleDateString('en-IN')}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="job-actions">
                                    <Link href={`/jobs/${job.id}`} className="view-btn">
                                        View Details
                                    </Link>
                                    <button 
                                        className="unsave-btn"
                                        onClick={() => handleUnsave(job.id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"/>
                                            <line x1="6" y1="6" x2="18" y2="18"/>
                                        </svg>
                                        Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            <style jsx>{`
                .saved-page {
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
                        radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.15) 0%, transparent 40%),
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
                    background: linear-gradient(135deg, var(--text-primary) 0%, #F59E0B 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-content p {
                    color: var(--text-secondary);
                    font-size: 1.125rem;
                }

                .saved-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 32px 20px;
                }

                /* Jobs List */
                .jobs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Job Card with Glassmorphism */
                .job-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-xl);
                    padding: var(--space-lg);
                    transition: all var(--transition-normal);
                }

                .job-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-xl), 0 0 20px rgba(124, 58, 237, 0.1);
                    border-color: rgba(124, 58, 237, 0.2);
                }

                .job-card-header {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
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

                .job-main {
                    flex: 1;
                    min-width: 0;
                }

                .job-main h3 {
                    font-size: 1.125rem;
                    margin-bottom: 8px;
                }

                .job-main h3 a {
                    color: var(--text-primary);
                    text-decoration: none;
                    transition: color var(--transition-fast);
                }

                .job-main h3 a:hover {
                    color: var(--color-primary-light);
                }

                .company-name {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin-bottom: 12px;
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
                    margin-bottom: 12px;
                }

                .job-meta span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .deadline {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8125rem;
                    color: var(--accent-warning);
                    font-weight: 500;
                }

                .job-actions {
                    display: flex;
                    gap: 12px;
                    flex-shrink: 0;
                    margin-left: 16px;
                }

                .view-btn {
                    padding: 10px 20px;
                    background: var(--gradient-primary);
                    color: white;
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.875rem;
                    transition: all var(--transition-fast);
                    box-shadow: var(--shadow-md);
                }

                .view-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg), var(--shadow-glow-primary);
                    color: white;
                }

                .unsave-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 16px;
                    background: transparent;
                    color: var(--text-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all var(--transition-fast);
                }

                .unsave-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: var(--accent-error);
                    color: var(--accent-error);
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

                .browse-btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: var(--gradient-primary);
                    color: white;
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    font-weight: 500;
                    transition: all var(--transition-fast);
                }

                .browse-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow-primary);
                    color: white;
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

                .error-fallback button {
                    padding: 12px 24px;
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .error-fallback button:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-glow-primary);
                }

                /* Skeleton */
                .job-card-skeleton {
                    background: var(--gradient-card);
                    border-radius: var(--radius-xl);
                    padding: var(--space-lg);
                }

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

                @media (max-width: 768px) {
                    .hero-content h1 {
                        font-size: 2rem;
                    }

                    .job-card {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .job-actions {
                        width: 100%;
                        margin-left: 0;
                    }

                    .job-meta {
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </div>
    );
}

