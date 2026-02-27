// frontend/pages/company/dashboard.js - Company Dashboard Page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { profileAPI, companyAPI } from '../../lib/api';

export default function CompanyDashboard() {
    const { data: dashboardData, error, mutate } = useSWR(
        '/api/profile/company/dashboard',
        () => profileAPI.getCompanyDashboard().then(res => res.data),
        { revalidateOnFocus: false }
    );

    const [activeTab, setActiveTab] = useState('overview');

    if (!dashboardData && !error) {
        return (
            <div className="dashboard-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 400px;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #4f46e5;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const company = dashboardData?.data;
    const jobStats = company?.jobStats || {};
    const applicantStats = company?.applicantStats || [];

    // Calculate stats
    const totalApplicants = applicantStats.reduce((sum, item) => sum + parseInt(item.count), 0);

    return (
        <div className="dashboard-page">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="company-info">
                        <h1>{company?.companyName}</h1>
                        <p>Company Dashboard</p>
                    </div>
                    <Link href="/company/jobs/new" className="post-job-btn">
                        + Post New Job
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <div className="stat-value">{jobStats.total_jobs || 0}</div>
                        <div className="stat-label">Total Jobs</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{jobStats.active_jobs || 0}</div>
                        <div className="stat-label">Active Jobs</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-content">
                        <div className="stat-value">{jobStats.total_views || 0}</div>
                        <div className="stat-label">Total Views</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <div className="stat-value">{jobStats.total_applications || 0}</div>
                        <div className="stat-label">Applications</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={`tab ${activeTab === 'applicants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('applicants')}
                >
                    Recent Applicants
                </button>
                <button 
                    className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('jobs')}
                >
                    Top Jobs
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-grid">
                        {/* Application Status */}
                        <div className="card">
                            <h3>Application Status</h3>
                            <div className="status-list">
                                {applicantStats.map((item, index) => (
                                    <div key={index} className="status-item">
                                        <span className="status-label">{item.status}</span>
                                        <span className="status-count">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card">
                            <h3>Quick Actions</h3>
                            <div className="actions-list">
                                <Link href="/company/jobs" className="action-link">
                                    <span>📋</span> Manage Jobs
                                </Link>
                                <Link href="/company/applicants" className="action-link">
                                    <span>📝</span> View All Applicants
                                </Link>
                                <Link href="/company/analytics" className="action-link">
                                    <span>📊</span> View Analytics
                                </Link>
                                <Link href="/company/settings" className="action-link">
                                    <span>⚙️</span> Company Settings
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'applicants' && (
                    <div className="card">
                        <h3>Recent Applicants</h3>
                        {company?.recentApplications?.length > 0 ? (
                            <div className="applicants-list">
                                {company.recentApplications.map((app) => (
                                    <div key={app.id} className="applicant-item">
                                        <div className="applicant-info">
                                            <div className="applicant-name">
                                                {app.first_name} {app.last_name}
                                            </div>
                                            <div className="applicant-meta">
                                                {app.candidate_email} • {app.candidate_location}
                                            </div>
                                            <div className="applicant-skills">
                                                {app.skills?.slice(0, 5).map((skill, i) => (
                                                    <span key={i} className="skill-tag">{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="applicant-status">
                                            <span className={`status-badge ${app.status}`}>
                                                {app.status}
                                            </span>
                                            <span className="applied-date">
                                                {new Date(app.applied_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-text">No applicants yet</p>
                        )}
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="card">
                        <h3>Top Performing Jobs</h3>
                        {company?.topJobs?.length > 0 ? (
                            <div className="jobs-list">
                                {company.topJobs.map((job) => (
                                    <div key={job.id} className="job-item">
                                        <div className="job-info">
                                            <div className="job-title">{job.title}</div>
                                            <div className="job-stats">
                                                <span>👁️ {job.views} views</span>
                                                <span>📝 {job.applications_count} applications</span>
                                            </div>
                                        </div>
                                        <Link href={`/company/jobs/${job.id}/applicants`} className="view-link">
                                            View Applicants →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-text">No jobs posted yet</p>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .dashboard-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .dashboard-header {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 32px;
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .company-info h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .company-info p {
                    margin: 4px 0 0;
                    opacity: 0.9;
                }

                .post-job-btn {
                    padding: 12px 24px;
                    background: white;
                    color: #4f46e5;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .post-job-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    max-width: 1200px;
                    margin: -24px auto 32px;
                    padding: 0 32px;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .stat-icon {
                    font-size: 32px;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1f2937;
                }

                .stat-label {
                    font-size: 14px;
                    color: #6b7280;
                }

                .tabs {
                    display: flex;
                    gap: 8px;
                    max-width: 1200px;
                    margin: 0 auto 24px;
                    padding: 0 32px;
                }

                .tab {
                    padding: 12px 24px;
                    background: white;
                    border: none;
                    border-radius: 8px 8px 0 0;
                    font-weight: 500;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tab.active {
                    background: white;
                    color: #4f46e5;
                    box-shadow: 0 -2px 0 #4f46e5 inset;
                }

                .tab-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 32px 32px;
                }

                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .card h3 {
                    margin: 0 0 20px 0;
                    font-size: 18px;
                    color: #1f2937;
                }

                .overview-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .status-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .status-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .status-label {
                    text-transform: capitalize;
                    color: #374151;
                }

                .status-count {
                    font-weight: 600;
                    color: #4f46e5;
                }

                .actions-list {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .action-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #374151;
                    transition: all 0.2s;
                }

                .action-link:hover {
                    background: #e0e7ff;
                    color: #4f46e5;
                }

                .applicants-list, .jobs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .applicant-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .applicant-name {
                    font-weight: 600;
                    color: #1f2937;
                }

                .applicant-meta {
                    font-size: 14px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                .applicant-skills {
                    display: flex;
                    gap: 6px;
                    margin-top: 8px;
                    flex-wrap: wrap;
                }

                .skill-tag {
                    background: #e0e7ff;
                    color: #4f46e5;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                }

                .applicant-status {
                    text-align: right;
                }

                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                    margin-bottom: 4px;
                }

                .status-badge.applied { background: #dbeafe; color: #1d4ed8; }
                .status-badge.screening { background: #fef3c7; color: #d97706; }
                .status-badge.interview { background: #d1fae5; color: #059669; }
                .status-badge.rejected { background: #fee2e2; color: #dc2626; }

                .applied-date {
                    display: block;
                    font-size: 12px;
                    color: #6b7280;
                }

                .job-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .job-title {
                    font-weight: 600;
                    color: #1f2937;
                }

                .job-stats {
                    display: flex;
                    gap: 16px;
                    font-size: 14px;
                    color: #6b7280;
                    margin-top: 4px;
                }

                .view-link {
                    color: #4f46e5;
                    text-decoration: none;
                    font-weight: 500;
                }

                .view-link:hover {
                    text-decoration: underline;
                }

                .empty-text {
                    text-align: center;
                    color: #6b7280;
                    padding: 40px;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }

                    .overview-grid {
                        grid-template-columns: 1fr;
                    }

                    .actions-list {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
