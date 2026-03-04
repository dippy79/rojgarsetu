// frontend/pages/jobs/[id].js - Job Details Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { jobsAPI } from '../../lib/api';
import { theme } from '../../styles/theme';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Loading skeleton
function JobDetailSkeleton() {
    return (
        <div className="job-detail-container">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <div className="skeleton" style={{ width: '80%', height: '40px', marginBottom: '20px' }} />
                <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ width: '100%', height: '120px', marginBottom: '20px' }} />
                <div className="skeleton" style={{ width: '40%', height: '48px', marginBottom: '16px' }} />
            </motion.div>
        </div>
    );
}

export default function JobDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [hasApplied, setHasApplied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);

    // Fetch job details
    const { data: response, error, isLoading } = useSWR(
        id ? `/api/jobs/${id}` : null,
        jobsAPI.getJob
    );

    const job = response?.data;

    const handleApply = async () => {
        if (!job || hasApplied || isApplying) return;

        setIsApplying(true);
        try {
            await jobsAPI.applyToJob(id, {
                cover_letter: 'Interested in this position',
                expected_salary: ''
            });
            
            setHasApplied(true);
            
            // Show success message
            if (typeof window !== 'undefined') {
                alert('Application submitted successfully!');
            }
        } catch (error) {
            console.error('Application error:', error);
            if (typeof window !== 'undefined') {
                alert('Failed to submit application. Please try again.');
            }
        } finally {
            setIsApplying(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const getDaysLeft = (dateStr) => {
        if (!dateStr) return null;
        const lastDate = new Date(dateStr);
        const today = new Date();
        const diffTime = lastDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Handle loading and error states
    if (!id) {
        return (
            <div className="error-container">
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <h1>Job Not Found</h1>
                    <p>Please check the URL and try again.</p>
                    <Link href="/jobs">
                        <button className="btn btn-primary">Browse All Jobs</button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return <JobDetailSkeleton />;
    }

    if (error || !job) {
        return (
            <div className="error-container">
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <h1>Job Not Found</h1>
                    <p>The job you're looking for might have been removed or is no longer available.</p>
                    <Link href="/jobs">
                        <button className="btn btn-primary">Browse All Jobs</button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    const daysLeft = getDaysLeft(job.last_date);
    const isExpired = daysLeft !== null && daysLeft <= 0;

    return (
        <div className="job-detail-page">
            {/* Breadcrumb */}
            <motion.div 
                className="breadcrumb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Link href="/jobs">← Back to Jobs</Link>
            </motion.div>

            <motion.div 
                className="job-detail-container"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
            >
                {/* Job Header */}
                <div className="job-header">
                    <div className="job-title-section">
                        <h1>{job.title}</h1>
                        <div className="job-badges">
                            <span className="badge category-badge">{job.category}</span>
                            {job.is_featured && <span className="badge featured-badge">Featured</span>}
                            {job.is_government && <span className="badge government-badge">Government</span>}
                            {isExpired && <span className="badge expired-badge">Expired</span>}
                        </div>
                    </div>
                    
                    <div className="job-meta-info">
                        <div className="meta-item">
                            <span className="meta-icon">🏢</span>
                            <span>{job.company || job.organization || 'RojgarSetu'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-icon">📍</span>
                            <span>{job.location || 'All India'}</span>
                        </div>
                        {job.salary && (
                            <div className="meta-item">
                                <span className="meta-icon">💰</span>
                                <span>{job.salary}</span>
                            </div>
                        )}
                        {job.type && (
                            <div className="meta-item">
                                <span className="meta-icon">💼</span>
                                <span>{job.type}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Details */}
                <div className="job-content">
                    <div className="content-section">
                        <h2>Job Description</h2>
                        <div className="content-text" dangerouslySetInnerHTML={{ __html: job.description || 'No description available' }} />
                    </div>

                    {job.eligibility_criteria && (
                        <div className="content-section">
                            <h2>Eligibility Criteria</h2>
                            <div className="content-text" dangerouslySetInnerHTML={{ __html: job.eligibility_criteria }} />
                        </div>
                    )}

                    {job.fees_structure && (
                        <div className="content-section">
                            <h2>Application Fees</h2>
                            <div className="content-text" dangerouslySetInnerHTML={{ __html: job.fees_structure }} />
                        </div>
                    )}

                    {job.last_date && (
                        <div className="content-section">
                            <h2>Application Deadline</h2>
                            <div className="deadline-info">
                                <p className="deadline-date">
                                    <span className="meta-icon">⏰</span>
                                    {formatDate(job.last_date)}
                                </p>
                                {!isExpired && (
                                    <p className={`deadline-days ${daysLeft < 7 ? 'urgent' : daysLeft < 30 ? 'warning' : 'safe'}`}>
                                        {daysLeft} days remaining
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Section */}
                <div className="action-section">
                    {job.apply_link ? (
                        <a 
                            href={job.apply_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary btn-lg"
                        >
                            Apply on Official Website
                            <span className="btn-icon">→</span>
                        </a>
                    ) : (
                        <button 
                            onClick={handleApply}
                            disabled={isExpired || hasApplied || isApplying}
                            className={`btn btn-primary btn-lg ${(hasApplied || isApplying) ? 'disabled' : ''}`}
                        >
                            {isApplying ? 'Applying...' : hasApplied ? 'Applied' : 'Apply Now'}
                            <span className="btn-icon">→</span>
                        </button>
                    )}
                    
                    <Link href="/jobs">
                        <button className="btn btn-secondary">
                            ← Back to Jobs
                        </button>
                    </Link>
                </div>
            </motion.div>

            <style jsx>{`
                .job-detail-page {
                    min-height: 100vh;
                    background: ${theme.colors.background.primary};
                    padding: 120px 20px 40px;
                }

                .breadcrumb {
                    margin-bottom: 32px;
                }

                .breadcrumb a {
                    color: ${theme.colors.text.secondary};
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s;
                }

                .breadcrumb a:hover {
                    color: ${theme.colors.primary};
                }

                .job-detail-container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: ${theme.colors.background.secondary};
                    border-radius: ${theme.borderRadius.xl};
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .job-header {
                    padding: 32px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .job-title-section h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: ${theme.colors.text.primary};
                    margin-bottom: 16px;
                    line-height: 1.3;
                }

                .job-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 20px;
                }

                .badge {
                    padding: 6px 12px;
                    border-radius: ${theme.borderRadius.full};
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .category-badge {
                    background: ${theme.colors.primary}20;
                    color: ${theme.colors.primary};
                }

                .featured-badge {
                    background: ${theme.colors.accent.warning}20;
                    color: ${theme.colors.accent.warning};
                }

                .government-badge {
                    background: ${theme.colors.primary}20;
                    color: ${theme.colors.primary};
                }

                .expired-badge {
                    background: ${theme.colors.accent.error}20;
                    color: ${theme.colors.accent.error};
                }

                .job-meta-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 24px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${theme.colors.text.secondary};
                    font-size: 0.9375rem;
                }

                .meta-icon {
                    font-size: 1.125rem;
                }

                .job-content {
                    padding: 32px;
                }

                .content-section {
                    margin-bottom: 32px;
                }

                .content-section h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: ${theme.colors.text.primary};
                    margin-bottom: 16px;
                }

                .content-text {
                    color: ${theme.colors.text.secondary};
                    line-height: 1.7;
                    font-size: 1rem;
                }

                .deadline-info {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: ${theme.borderRadius.lg};
                    padding: 20px;
                    margin-top: 16px;
                }

                .deadline-date {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: ${theme.colors.text.primary};
                    margin-bottom: 8px;
                }

                .deadline-days {
                    font-size: 0.9375rem;
                    font-weight: 500;
                }

                .deadline-days.safe {
                    color: ${theme.colors.accent.success};
                }

                .deadline-days.warning {
                    color: ${theme.colors.accent.warning};
                }

                .deadline-days.urgent {
                    color: ${theme.colors.accent.error};
                }

                .action-section {
                    padding: 32px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                .btn {
                    padding: 14px 28px;
                    border-radius: ${theme.borderRadius.lg};
                    font-weight: 600;
                    font-size: 1rem;
                    text-decoration: none;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-primary {
                    background: ${theme.colors.primary};
                    color: white;
                }

                .btn-primary:hover:not(.disabled) {
                    background: ${theme.colors.primaryDark};
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
                }

                .btn-secondary {
                    background: transparent;
                    color: ${theme.colors.text.secondary};
                    border: 2px solid ${theme.colors.background.tertiary};
                }

                .btn-secondary:hover {
                    background: ${theme.colors.background.tertiary};
                    color: ${theme.colors.text.primary};
                }

                .btn.disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-lg {
                    padding: 16px 32px;
                    font-size: 1.125rem;
                }

                .btn-icon {
                    transition: transform 0.2s;
                }

                .btn:hover .btn-icon {
                    transform: translateX(4px);
                }

                .error-container {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 40px 20px;
                }

                .error-container h1 {
                    font-size: 2rem;
                    color: ${theme.colors.text.primary};
                    margin-bottom: 16px;
                }

                .error-container p {
                    color: ${theme.colors.text.secondary};
                    margin-bottom: 24px;
                    font-size: 1.125rem;
                }

                .skeleton {
                    background: linear-gradient(90deg, 
                        ${theme.colors.background.tertiary} 25%, 
                        ${theme.colors.background.secondary} 50%, 
                        ${theme.colors.background.tertiary} 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: ${theme.borderRadius.md};
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                @media (max-width: 768px) {
                    .job-detail-page {
                        padding: 100px 16px 32px;
                    }

                    .job-header,
                    .job-content,
                    .action-section {
                        padding: 24px;
                    }

                    .job-title-section h1 {
                        font-size: 1.5rem;
                    }

                    .job-meta-info {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .action-section {
                        flex-direction: column;
                    }

                    .btn {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
