// frontend/pages/profile/index.js - Candidate Profile Page with dark glassmorphism design
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { profileAPI, jobsAPI } from '../../lib/api';

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

export default function Profile() {
    const { data: profileData, error: profileError, isLoading, mutate: mutateProfile } = useSWR(
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
                bio: profileData.data.bio || ''
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

    if (isLoading) {
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
                        min-height: 100vh;
                        background: var(--bg-primary);
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid var(--bg-tertiary);
                        border-top: 4px solid var(--color-primary);
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
    const stats = dashboardData?.data || {};

    return (
        <div className="profile-page">
            {/* Hero Section */}
            <section className="hero-small">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="profile-header">
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
                </motion.div>
            </section>

            <div className="profile-container">
                {/* Stats Cards */}
                <motion.div 
                    className="stats-grid"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="stat-card" variants={fadeInUp}>
                        <div className="stat-icon">⭐</div>
                        <div className="stat-value">{stats.savedJobsCount || 0}</div>
                        <div className="stat-label">Saved Jobs</div>
                    </motion.div>
                    <motion.div className="stat-card" variants={fadeInUp}>
                        <div className="stat-icon">📝</div>
                        <div className="stat-value">{stats.applicationStats?.total_applied || 0}</div>
                        <div className="stat-label">Applications</div>
                    </motion.div>
                    <motion.div className="stat-card" variants={fadeInUp}>
                        <div className="stat-icon">📅</div>
                        <div className="stat-value">{stats.applicationStats?.interview || 0}</div>
                        <div className="stat-label">Interviews</div>
                    </motion.div>
                    <motion.div className="stat-card" variants={fadeInUp}>
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{stats.applicationStats?.hired || 0}</div>
                        <div className="stat-label">Hired</div>
                    </motion.div>
                </motion.div>

                {/* Main Content */}
                <div className="content-grid">
                    {/* Profile Details */}
                    <motion.div 
                        className="glass-card"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="card-header">
                            <h2>Profile Details</h2>
                        </div>
                        
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
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="form-input"
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
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="form-input"
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
                                        className="form-input"
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
                                        className="form-input"
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
                                        className="form-input"
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
                                        className="form-input"
                                    />
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
                                            <span className="not-set">No skills added</span>
                                        )}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>Bio</label>
                                    <span>{profile?.bio || 'Not set'}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Links */}
                    <div className="sidebar">
                        <motion.div 
                            className="glass-card"
                            variants={fadeInUp}
                            initial="hidden"
                            animate="visible"
                        >
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
                        </motion.div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .profile-page {
                    min-height: 100vh;
                    background: var(--bg-primary);
                }

                .hero-small {
                    padding: 80px 20px 40px;
                    background: var(--gradient-hero);
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
                    max-width: 800px;
                    margin: 0 auto;
                }

                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }

                .avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--gradient-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .header-info {
                    flex: 1;
                }

                .header-info h1 {
                    font-size: 1.75rem;
                    margin: 0;
                    color: var(--text-primary);
                }

                .email {
                    margin: 4px 0;
                    color: var(--text-secondary);
                }

                .location {
                    margin: 0;
                    color: var(--text-tertiary);
                    font-size: 0.875rem;
                }

                .edit-btn {
                    padding: 10px 20px;
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    box-shadow: var(--shadow-md);
                }

                .edit-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg), var(--shadow-glow-primary);
                }

                .completeness-bar {
                    margin-top: 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-lg);
                    padding: 16px;
                }

                .completeness-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .progress-bar {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress {
                    height: 100%;
                    background: var(--gradient-primary);
                    transition: width 0.3s;
                }

                .profile-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 32px 20px;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .stat-card {
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-xl);
                    padding: 24px;
                    text-align: center;
                    transition: all var(--transition-normal);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-xl), 0 0 20px rgba(124, 58, 237, 0.1);
                }

                .stat-icon {
                    font-size: 2rem;
                    margin-bottom: 8px;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-primary-light);
                }

                .stat-label {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin-top: 4px;
                }

                /* Content Grid */
                .content-grid {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 24px;
                }

                /* Glass Card */
                .glass-card {
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-xl);
                    padding: var(--space-lg);
                }

                .card-header {
                    margin-bottom: 24px;
                }

                .card-header h2 {
                    font-size: 1.25rem;
                    color: var(--text-primary);
                    margin: 0;
                }

                .glass-card h3 {
                    font-size: 1rem;
                    color: var(--text-primary);
                    margin: 0 0 16px 0;
                }

                /* Details List */
                .details-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .detail-item label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .detail-item span {
                    color: var(--text-primary);
                }

                .not-set {
                    color: var(--text-tertiary) !important;
                    font-style: italic;
                }

                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .skill-tag {
                    background: rgba(124, 58, 237, 0.15);
                    color: var(--color-primary-light);
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: 0.875rem;
                }

                /* Sidebar */
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
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    color: var(--text-secondary);
                    transition: all var(--transition-fast);
                }

                .quick-link:hover {
                    background: rgba(124, 58, 237, 0.1);
                    color: var(--text-primary);
                }

                /* Edit Form */
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
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .form-input {
                    padding: 12px 16px;
                    background: var(--bg-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    transition: all var(--transition-fast);
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--color-primary);
                    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
                }

                .form-input::placeholder {
                    color: var(--text-tertiary);
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 8px;
                }

                .save-btn {
                    padding: 12px 24px;
                    background: var(--gradient-primary);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .save-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg), var(--shadow-glow-primary);
                }

                .save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .profile-header {
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

