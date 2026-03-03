// frontend/pages/applications/index.js - My Applications Page with dark glassmorphism design
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

export default function Applications() {
    const [filter, setFilter] = useState('all');
    const { data, error, isLoading, mutate } = useSWR(
        `/api/jobs/applications?${filter !== 'all' ? `status=${filter}` : ''}`,
        () => jobsAPI.getMyApplications({ status: filter !== 'all' ? filter : undefined }).then(res => res.data),
        { revalidateOnFocus: false }
    );

    const handleWithdraw = async (jobId) => {
        if (!confirm('Are you sure you want to withdraw this application?')) return;
        
        try {
            await jobsAPI.withdrawApplication(jobId);
            mutate();
        } catch (err) {
            console.error('Failed to withdraw application:', err);
        }
    };

    const applications = data?.data || [];
    
    const statusCounts = {
        all: applications.length,
        applied: applications.filter(a => a.status === 'applied').length,
        screening: applications.filter(a => a.status === 'screening').length,
        interview: applications.filter(a => a.status === 'interview').length,
        hired: applications.filter(a => a.status === 'hired').length,
        rejected: applications.filter(a => a.status === 'rejected').length
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'applied': return 'Pending';
            case 'screening': return 'Shortlisted';
            case 'interview': return 'Interview';
            case 'hired': return 'Hired';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    return (
        <div className="applications-page">
            {/* Hero Section */}
            <section className="hero-small">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>My Applications</h1>
                    <p>Track your job applications</p>
                </motion.div>
            </section>

            {/* Filters */}
            <div className="filters-container">
                <div className="filters">
                    {['all', 'applied', 'screening', 'interview', 'hired', 'rejected'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            <span className="count">{statusCounts[status]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            <div className="applications-container">
                {error && (
                    <div className="error-fallback">
                        <h3>Unable to load applications</h3>
                        <p>Please try again later.</p>
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                )}

                {isLoading ? (
                    <motion.div 
                        className="applications-list"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="application-skeleton">
                                <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '8px' }} />
                                <div className="skeleton" style={{ width: '40%', height: '16px', marginBottom: '16px' }} />
                                <div className="skeleton" style={{ width: '80%', height: '40px' }} />
                            </div>
                        ))}
                    </motion.div>
                ) : applications.length === 0 ? (
                    <motion.div 
                        className="empty-state"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="empty-state-icon">📋</div>
                        <h3>No applications yet</h3>
                        <p>Start applying to jobs to see them here</p>
                        <Link href="/jobs" className="browse-btn">
                            Browse Jobs
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="applications-list"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {applications.map((app, index) => (
                            <motion.div 
                                key={app.id} 
                                className="application-card"
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="application-main">
                                    <div className="job-title">{app.title}</div>
                                    <div className="company-name">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                            <polyline points="9,22 9,12 15,12 15,22"/>
                                        </svg>
                                        {app.company_name || 'Company'}
                                    </div>
                                    <div className="job-meta">
                                        <span>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                <circle cx="12" cy="10" r="3"/>
                                            </svg>
                                            {app.location || 'Not specified'}
                                        </span>
                                        {app.type && (
                                            <span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                                </svg>
                                                {app.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="application-status">
                                    <span className={`status-badge ${app.status}`}>
                                        {getStatusLabel(app.status)}
                                    </span>
                                    <div className="applied-date">
                                        Applied {new Date(app.applied_at).toLocaleDateString('en-IN')}
                                    </div>
                                    {app.status === 'applied' && (
                                        <button 
                                            className="withdraw-btn"
                                            onClick={() => handleWithdraw(app.job_id)}
                                        >
                                            Withdraw
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            <style jsx>{`
                .applications-page {
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

                /* Filters */
                .filters-container {
                    background: var(--bg-secondary);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .filters {
                    display: flex;
                    gap: 8px;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 16px 20px;
                    overflow-x: auto;
                }

                .filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: var(--bg-tertiary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all var(--transition-fast);
                }

                .filter-btn:hover {
                    background: rgba(124, 58, 237, 0.1);
                    border-color: var(--color-primary);
                    color: var(--text-primary);
                }

                .filter-btn.active {
                    background: var(--gradient-primary);
                    color: white;
                    border-color: var(--color-primary);
                }

                .count {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                }

                .filter-btn.active .count {
                    background: rgba(255, 255, 255, 0.2);
                }

                /* Applications Container */
                .applications-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px 20px;
                }

                /* Applications List */
                .applications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Application Card with Glassmorphism */
                .application-card {
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

                .application-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-xl), 0 0 20px rgba(124, 58, 237, 0.1);
                    border-color: rgba(124, 58, 237, 0.2);
                }

                .application-main {
                    flex: 1;
                    min-width: 0;
                }

                .job-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 4px;
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
                    gap: 16px;
                    color: var(--text-tertiary);
                    font-size: 0.8125rem;
                }

                .job-meta span {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .application-status {
                    text-align: right;
                    flex-shrink: 0;
                    margin-left: 16px;
                }

                .status-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-transform: capitalize;
                    margin-bottom: 8px;
                }

                .status-badge.applied { background: rgba(59, 130, 246, 0.15); color: #3B82F6; }
                .status-badge.screening { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
                .status-badge.interview { background: rgba(16, 185, 129, 0.15); color: #10B981; }
                .status-badge.hired { background: rgba(16, 185, 129, 0.15); color: #10B981; }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #EF4444; }

                .applied-date {
                    font-size: 0.8125rem;
                    color: var(--text-tertiary);
                    margin-bottom: 8px;
                }

                .withdraw-btn {
                    padding: 6px 16px;
                    background: transparent;
                    color: var(--accent-error);
                    border: 1px solid var(--accent-error);
                    border-radius: var(--radius-md);
                    font-size: 0.8125rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .withdraw-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
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
                .application-skeleton {
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

                    .application-card {
                        flex-direction: column;
                        gap: 16px;
                    }

                    .application-status {
                        text-align: center;
                        margin-left: 0;
                    }

                    .job-meta {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
}

