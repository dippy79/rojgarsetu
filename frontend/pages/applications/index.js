// frontend/pages/applications/index.js - My Applications Page
import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { jobsAPI } from '../../lib/api';

export default function Applications() {
    const [filter, setFilter] = useState('all');
    const { data, error, mutate } = useSWR(
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

    return (
        <div className="applications-page">
            {/* Header */}
            <div className="page-header">
                <h1>My Applications</h1>
                <p>Track your job applications</p>
            </div>

            {/* Filters */}
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

            {/* Applications List */}
            <div className="applications-list">
                {error ? (
                    <div className="error-message">
                        Failed to load applications. Please try again.
                    </div>
                ) : !data ? (
                    <div className="loading">Loading applications...</div>
                ) : applications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>No applications yet</h3>
                        <p>Start applying to jobs to see them here</p>
                        <Link href="/jobs" className="browse-jobs-btn">
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    applications.map(app => (
                        <div key={app.id} className="application-card">
                            <div className="application-main">
                                <div className="job-title">{app.title}</div>
                                <div className="company-name">{app.company_name || 'Company'}</div>
                                <div className="job-meta">
                                    <span>📍 {app.location || 'Not specified'}</span>
                                    <span>💼 {app.type}</span>
                                    {app.salary_min && app.salary_max && (
                                        <span>💰 ₹{app.salary_min} - ₹{app.salary_max}</span>
                                    )}
                                </div>
                            </div>
                            <div className="application-status">
                                <span className={`status-badge ${app.status}`}>
                                    {app.status === 'applied' ? 'Pending' : 
                                     app.status === 'screening' ? 'Shortlisted' :
                                     app.status === 'interview' ? 'Interview' :
                                     app.status === 'hired' ? 'Hired' :
                                     app.status === 'rejected' ? 'Rejected' : app.status}
                                </span>
                                <div className="applied-date">
                                    Applied {new Date(app.applied_at).toLocaleDateString()}
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
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .applications-page {
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

                .filters {
                    display: flex;
                    gap: 8px;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 32px;
                    overflow-x: auto;
                }

                .filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #6b7280;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .filter-btn.active {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                }

                .count {
                    background: rgba(0,0,0,0.1);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }

                .filter-btn.active .count {
                    background: rgba(255,255,255,0.2);
                }

                .applications-list {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 32px 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .application-card {
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
                    margin-bottom: 4px;
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
                }

                .application-status {
                    text-align: right;
                }

                .status-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                    text-transform: capitalize;
                    margin-bottom: 8px;
                }

                .status-badge.applied { background: #dbeafe; color: #1d4ed8; }
                .status-badge.screening { background: #fef3c7; color: #d97706; }
                .status-badge.interview { background: #d1fae5; color: #059669; }
                .status-badge.hired { background: #d1fae5; color: #059669; }
                .status-badge.rejected { background: #fee2e2; color: #dc2626; }

                .applied-date {
                    font-size: 14px;
                    color: #6b7280;
                    margin-bottom: 8px;
                }

                .withdraw-btn {
                    padding: 6px 16px;
                    background: transparent;
                    color: #dc2626;
                    border: 1px solid #dc2626;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .withdraw-btn:hover {
                    background: #fee2e2;
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
                    .application-card {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }

                    .application-status {
                        text-align: center;
                    }

                    .job-meta {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}
