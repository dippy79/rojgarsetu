// frontend/pages/profile/index.js - Candidate Profile Page
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { profileAPI, jobsAPI } from '../../lib/api';

export default function Profile() {
    const { data: profileData, error: profileError, mutate: mutateProfile } = useSWR(
        '/api/profile/candidate',
        () => profileAPI.getCandidateProfile().then(res => res.data),
        { revalidateOnFocus: false }
    );

    const { data: dashboardData } = useSWR(
        '/api/profile/candidate/dashboard',
        () => profileAPI.getCandidateDashboard().then(res => res.data),
        { revalidateOnFocus: false }
    );

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profileData?.data) {
            setFormData({
                firstName: profileData.data.first_name || '',
                lastName: profileData.data.last_name || '',
                phone: profileData.data.phone || '',
                location: profileData.data.location || '',
                education: profileData.data.education || '',
                experience: profileData.data.experience || '',
                skills: profileData.data.skills?.join(', ') || '',
                bio: profileData.data.bio || '',
                linkedinUrl: profileData.data.linkedin_url || '',
                portfolioUrl: profileData.data.portfolio_url || '',
                expectedSalaryMin: profileData.data.expected_salary_min || '',
                expectedSalaryMax: profileData.data.expected_salary_max || ''
            });
        }
    }, [profileData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
        
        try {
            await profileAPI.updateCandidateProfile({
                ...formData,
                skills: skillsArray
            });
            setIsEditing(false);
            mutateProfile();
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!profileData && !profileError) {
        return (
            <div className="profile-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
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

    const profile = profileData?.data;
    const stats = dashboardData?.data?.applicationStats || {};

    return (
        <div className="profile-page">
            {/* Header */}
            <div className="profile-header">
                <div className="header-content">
                    <div className="avatar">
                        {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </div>
                    <div className="header-info">
                        <h1>{profile?.first_name} {profile?.last_name}</h1>
                        <p className="email">{profile?.email}</p>
                        <p className="location">{profile?.location || 'Location not set'}</p>
                    </div>
                    <button 
                        className="edit-btn"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>
                
                {/* Profile Completeness */}
                <div className="completeness-bar">
                    <div className="completeness-label">
                        <span>Profile Completeness</span>
                        <span>{profile?.profile_completeness || 0}%</span>
                    </div>
                    <div className="progress-bar">
                        <div 
                            className="progress" 
                            style={{ width: `${profile?.profile_completeness || 0}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="profile-content">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{dashboardData?.data?.savedJobsCount || 0}</div>
                        <div className="stat-label">Saved Jobs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.total_applied || 0}</div>
                        <div className="stat-label">Applications</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.interview || 0}</div>
                        <div className="stat-label">Interviews</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.hired || 0}</div>
                        <div className="stat-label">Hired</div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="content-grid">
                    {/* Profile Details */}
                    <div className="card">
                        <h2>Profile Details</h2>
                        
                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="edit-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Education</label>
                                    <textarea
                                        name="education"
                                        value={formData.education}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Your educational background"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Experience</label>
                                    <textarea
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Your work experience"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Skills (comma separated)</label>
                                    <input
                                        type="text"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        placeholder="JavaScript, React, Node.js"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Tell us about yourself"
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>LinkedIn URL</label>
                                        <input
                                            type="url"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Portfolio URL</label>
                                        <input
                                            type="url"
                                            name="portfolioUrl"
                                            value={formData.portfolioUrl}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expected Salary (Min)</label>
                                        <input
                                            type="number"
                                            name="expectedSalaryMin"
                                            value={formData.expectedSalaryMin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Expected Salary (Max)</label>
                                        <input
                                            type="number"
                                            name="expectedSalaryMax"
                                            value={formData.expectedSalaryMax}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-actions">
                                    <button type="submit" className="save-btn" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="details-list">
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <span>{profile?.phone || 'Not set'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Location</label>
                                    <span>{profile?.location || 'Not set'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Education</label>
                                    <span>{profile?.education || 'Not set'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Experience</label>
                                    <span>{profile?.experience || 'Not set'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Skills</label>
                                    <div className="skills-list">
                                        {profile?.skills?.length > 0 ? (
                                            profile.skills.map((skill, index) => (
                                                <span key={index} className="skill-tag">{skill}</span>
                                            ))
                                        ) : (
                                            <span>No skills added</span>
                                        )}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>Bio</label>
                                    <span>{profile?.bio || 'Not set'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Expected Salary</label>
                                    <span>
                                        {profile?.expected_salary_min && profile?.expected_salary_max
                                            ? `₹${profile.expected_salary_min} - ₹${profile.expected_salary_max}`
                                            : 'Not set'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div className="sidebar">
                        <div className="card">
                            <h3>Quick Links</h3>
                            <div className="links-list">
                                <Link href="/applications" className="quick-link">
                                    <span>📋</span> My Applications
                                </Link>
                                <Link href="/saved" className="quick-link">
                                    <span>⭐</span> Saved Jobs
                                </Link>
                                <Link href="/notifications" className="quick-link">
                                    <span>🔔</span> Notifications
                                </Link>
                            </div>
                        </div>

                        {/* Recent Applications */}
                        <div className="card">
                            <h3>Recent Applications</h3>
                            {profile?.recentApplications?.length > 0 ? (
                                <div className="recent-list">
                                    {profile.recentApplications.map(app => (
                                        <div key={app.id} className="recent-item">
                                            <div className="recent-title">{app.title}</div>
                                            <div className="recent-meta">
                                                <span className={`status ${app.status}`}>{app.status}</span>
                                                <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-text">No applications yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .profile-header {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 32px;
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: white;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 700;
                }

                .header-info {
                    flex: 1;
                }

                .header-info h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .email {
                    margin: 4px 0;
                    opacity: 0.9;
                }

                .location {
                    margin: 0;
                    opacity: 0.8;
                }

                .edit-btn {
                    padding: 10px 20px;
                    background: white;
                    color: #4f46e5;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .edit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .completeness-bar {
                    max-width: 1200px;
                    margin: 24px auto 0;
                    background: rgba(255,255,255,0.2);
                    border-radius: 8px;
                    padding: 16px;
                }

                .completeness-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                }

                .progress-bar {
                    height: 8px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress {
                    height: 100%;
                    background: #10b981;
                    transition: width 0.3s;
                }

                .profile-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #4f46e5;
                }

                .stat-label {
                    color: #6b7280;
                    font-size: 14px;
                    margin-top: 4px;
                }

                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 24px;
                }

                .card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .card h2 {
                    margin: 0 0 24px 0;
                    font-size: 20px;
                    color: #1f2937;
                }

                .card h3 {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    color: #1f2937;
                }

                .details-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .detail-item label {
                    display: block;
                    font-size: 12px;
                    color: #6b7280;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .detail-item span {
                    color: #1f2937;
                }

                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .skill-tag {
                    background: #e0e7ff;
                    color: #4f46e5;
                    padding: 4px 12px;
                    border-radius: 16px;
                    font-size: 14px;
                }

                .sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .links-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .quick-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                    text-decoration: none;
                    color: #1f2937;
                    transition: all 0.2s;
                }

                .quick-link:hover {
                    background: #e0e7ff;
                    color: #4f46e5;
                }

                .recent-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .recent-item {
                    padding: 12px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .recent-title {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 4px;
                }

                .recent-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #6b7280;
                }

                .status {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    text-transform: capitalize;
                }

                .status.applied { background: #dbeafe; color: #1d4ed8; }
                .status.interview { background: #d1fae5; color: #059669; }
                .status.hired { background: #d1fae5; color: #059669; }
                .status.rejected { background: #fee2e2; color: #dc2626; }

                .empty-text {
                    color: #6b7280;
                    text-align: center;
                    padding: 20px;
                }

                .edit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .form-group label {
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }

                .form-group input,
                .form-group textarea {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 8px;
                }

                .save-btn {
                    padding: 10px 24px;
                    background: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .save-btn:hover:not(:disabled) {
                    background: #4338ca;
                }

                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .header-content {
                        flex-direction: column;
                        text-align: center;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .content-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
