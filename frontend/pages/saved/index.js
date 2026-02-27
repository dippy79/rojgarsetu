// frontend/pages/saved/index.js - Saved Jobs Page
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { jobsAPI } from '../../lib/api';

export default function SavedJobs() {
    const [filter, setFilter] = useState('all');
    const { data, error, mutate } = useSWR(
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
            {/* Header */}
            <div className="page-header">
                <h1>Saved Jobs</h1>
                <p>Jobs you've bookmarked for later</p>
            </div>

            {/* Saved Jobs List */}
            <div className="jobs-list">
                {error ? (
                    <div className="error-message">
                        Failed to load saved jobs. Please try again.
                    </div>
                ) : !data ? (
                    <div className="loading">Loading saved jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⭐</div>
                        <h3>No saved jobs</h3>
                        <p>Save jobs you're interested in to view them here</p>
                        <Link href="/jobs" className="browse-jobs-btn">
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div key={job.id} className="job-card">
                            <div className="job-main">
                                <Link href={`/jobs/${job.id}`} className="job-title">
                                    {job.title}
                                </Link>
                                <div className="company-name">
                                    {job.company_name || job.source || 'Company'}
                                </div>
                                <div className="job-meta">
                                    <span>📍 {job.location || 'All India'}</span>
                                    <span>💼 {job.type}</span>
                                    {job.salary_min && job.salary_max && (
                                        <span>💰 ₹{job.salary_min} - ₹{job.salary_max}</span>
                                    )}
                                </div>
                                {job.last_date && (
                                    <div className="deadline">
                                        📅 Last date: {new Date(job.last_date).toLocaleDateString()}
                                    </div>
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
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .saved-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .page-header {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 40px 32px;
                    text-align: center;
                }

                .page-header h1 {
                    margin: 0;
                    font-size: 32px;
                }

                .page-header p {
                    margin: 8px 0 0;
                    opacity: 0.9;
                }

                .jobs-list {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .job-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .job-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                }

                .job-title:hover {
                    color: #4f46e5;
                }

                .company-name {
                    color: #6b7280;
                    margin-bottom: 12px;
                }

                .job-meta {
                    display: flex;
                    gap: 16px;
                    font-size: 14px;
                    color: #6b7280;
                    flex-wrap: wrap;
                }

                .deadline {
                    margin-top: 12px;
                    font-size: 14px;
                    color: #dc2626;
                }

                .job-actions {
                    display: flex;
                    gap: 12px;
                }

                .view-btn {
                    padding: 10px 20px;
                    background: #4f46e5;
                    color: white;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .view-btn:hover {
                    background: #4338ca;
                }

                .unsave-btn {
                    padding: 10px 20px;
                    background: transparent;
                    color: #6b7280;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .unsave-btn:hover {
                    background: #fee2e2;
                    color: #dc2626;
                    border-color: #dc2626;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 12px;
                }

                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    margin: 0;
                    color: #1f2937;
                }

                .empty-state p {
                    color: #6b7280;
                    margin: 8px 0 24px;
                }

                .browse-jobs-btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #4f46e5;
                    color: white;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                }

                .loading, .error-message {
                    text-align: center;
                    padding: 40px;
                    color: #6b7280;
                }

                .error-message {
                    color: #dc2626;
                }

                @media (max-width: 768px) {
                    .job-card {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }

                    .job-actions {
                        width: 100%;
                        justify-content: center;
                    }

                    .job-meta {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
