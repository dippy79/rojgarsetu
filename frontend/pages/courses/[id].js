// frontend/pages/courses/[id].js - Course Details Page
import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { coursesAPI } from '../../lib/api';
import { theme } from '../../styles/theme';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Loading skeleton
function CourseDetailSkeleton() {
    return (
        <div className="course-detail-container">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                <div className="skeleton" style={{ width: '80%', height: '40px', marginBottom: '20px' }} />
                <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ width: '100%', height: '120px', marginBottom: '20px' }} />
                <div className="skeleton" style={{ width: '40%', height: '48px', marginBottom: '16px' }} />
            </motion.div>
        </div>
    );
}

export default function CourseDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [hasEnrolled, setHasEnrolled] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);

    // Fetch course details
    const { data: response, error, isLoading } = useSWR(
        id ? `/api/courses/${id}` : null,
        coursesAPI.getCourse
    );

    const course = response?.data;

    const handleEnroll = async () => {
        if (!course || hasEnrolled || isEnrolling) return;

        setIsEnrolling(true);
        try {
            // For now, we'll just mark as enrolled and show success
            // In a real implementation, this would call an enrollment API
            setHasEnrolled(true);
            
            // Show success message
            if (typeof window !== 'undefined') {
                alert('Enrollment request submitted successfully!');
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            if (typeof window !== 'undefined') {
                alert('Failed to submit enrollment. Please try again.');
            }
        } finally {
            setIsEnrolling(false);
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

    const formatFees = (fees) => {
        if (!fees || fees === '0' || fees.toLowerCase() === 'free') return 'Free';
        return '₹' + fees;
    };

    // Handle loading and error states
    if (!id) {
        return (
            <div className="error-container">
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <h1>Course Not Found</h1>
                    <p>Please check the URL and try again.</p>
                    <Link href="/courses">
                        <button className="btn btn-primary">Browse All Courses</button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isLoading) {
        return <CourseDetailSkeleton />;
    }

    if (error || !course) {
        return (
            <div className="error-container">
                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                    <h1>Course Not Found</h1>
                    <p>The course you're looking for might have been removed or is no longer available.</p>
                    <Link href="/courses">
                        <button className="btn btn-primary">Browse All Courses</button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="course-detail-page">
            {/* Breadcrumb */}
            <motion.div 
                className="breadcrumb"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Link href="/courses">← Back to Courses</Link>
            </motion.div>

            <motion.div 
                className="course-detail-container"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.3 }}
            >
                {/* Course Header */}
                <div className="course-header">
                    <div className="course-title-section">
                        <h1>{course.title}</h1>
                        <div className="course-badges">
                            <span className="badge category-badge">{course.category}</span>
                            {course.is_featured && <span className="badge featured-badge">Popular</span>}
                            {!course.is_active && <span className="badge inactive-badge">Inactive</span>}
                        </div>
                    </div>
                    
                    <div className="course-meta-info">
                        <div className="meta-item">
                            <span className="meta-icon">🏫</span>
                            <span>{course.provider || 'RojgarSetu'}</span>
                        </div>
                        {course.duration && (
                            <div className="meta-item">
                                <span className="meta-icon">⏱️</span>
                                <span>{course.duration}</span>
                            </div>
                        )}
                        <div className="meta-item">
                            <span className="meta-icon">💰</span>
                            <span>{formatFees(course.fees)}</span>
                        </div>
                    </div>
                </div>

                {/* Course Details */}
                <div className="course-content">
                    <div className="content-section">
                        <h2>Course Description</h2>
                        <div className="content-text" dangerouslySetInnerHTML={{ __html: course.description || 'No description available' }} />
                    </div>

                    {course.created_at && (
                        <div className="content-section">
                            <h2>Course Information</h2>
                            <div className="course-info-grid">
                                <div className="info-item">
                                    <span className="info-label">Added on:</span>
                                    <span className="info-value">{formatDate(course.created_at)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Category:</span>
                                    <span className="info-value">{course.category}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Mode:</span>
                                    <span className="info-value">{course.mode || 'Online'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Section */}
                <div className="action-section">
                    {course.apply_link ? (
                        <a 
                            href={course.apply_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-primary btn-lg"
                        >
                            Enroll on Official Website
                            <span className="btn-icon">→</span>
                        </a>
                    ) : (
                        <button 
                            onClick={handleEnroll}
                            disabled={!course.is_active || hasEnrolled || isEnrolling}
                            className={`btn btn-primary btn-lg ${(hasEnrolled || isEnrolling) ? 'disabled' : ''}`}
                        >
                            {isEnrolling ? 'Enrolling...' : hasEnrolled ? 'Enrolled' : 'Enroll Now'}
                            <span className="btn-icon">→</span>
                        </button>
                    )}
                    
                    <Link href="/courses">
                        <button className="btn btn-secondary">
                            ← Back to Courses
                        </button>
                    </Link>
                </div>
            </motion.div>

            <style jsx>{`
                .course-detail-page {
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
                    color: ${theme.colors.secondary};
                }

                .course-detail-container {
                    max-width: 900px;
                    margin: 0 auto;
                    background: ${theme.colors.background.secondary};
                    border-radius: ${theme.borderRadius.xl};
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }

                .course-header {
                    padding: 32px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .course-title-section h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: ${theme.colors.text.primary};
                    margin-bottom: 16px;
                    line-height: 1.3;
                }

                .course-badges {
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
                    background: ${theme.colors.secondary}20;
                    color: ${theme.colors.secondary};
                }

                .featured-badge {
                    background: ${theme.colors.accent.warning}20;
                    color: ${theme.colors.accent.warning};
                }

                .inactive-badge {
                    background: ${theme.colors.accent.error}20;
                    color: ${theme.colors.accent.error};
                }

                .course-meta-info {
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

                .course-content {
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

                .course-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 16px;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-label {
                    font-size: 0.875rem;
                    color: ${theme.colors.text.tertiary};
                    font-weight: 500;
                }

                .info-value {
                    font-size: 0.9375rem;
                    color: ${theme.colors.text.secondary};
                    font-weight: 600;
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
                    background: ${theme.colors.secondary};
                    color: white;
                }

                .btn-primary:hover:not(.disabled) {
                    background: ${theme.colors.secondaryDark};
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(6, 182, 212, 0.3);
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
                    .course-detail-page {
                        padding: 100px 16px 32px;
                    }

                    .course-header,
                    .course-content,
                    .action-section {
                        padding: 24px;
                    }

                    .course-title-section h1 {
                        font-size: 1.5rem;
                    }

                    .course-meta-info {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .course-info-grid {
                        grid-template-columns: 1fr;
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
