// frontend/pages/notifications/index.js - Notifications page with dark glassmorphism design
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { motion } from 'framer-motion';
import { notificationsAPI } from '../../lib/api';

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

// Notification card component
function NotificationCard({ notification, onMarkAsRead }) {
    const getIcon = (type) => {
        switch (type) {
            case 'job_alert': return '💼';
            case 'application': return '📝';
            case 'interview': return '📅';
            case 'system': return '🔔';
            default: return '🔔';
        }
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <motion.div 
            className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
        >
            <div className="notification-icon">
                {getIcon(notification.type)}
            </div>
            <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{getTimeAgo(notification.created_at)}</span>
            </div>
            {!notification.is_read && <div className="unread-dot" />}
        </motion.div>
    );
}

export default function NotificationsPage() {
    // Fetch notifications
    const { data: notificationsData, error, isLoading, mutate: mutateNotifications } = useSWR(
        '/api/notifications',
        fetcher,
        { revalidateOnFocus: false }
    );

    // Fetch unread count
    const { data: unreadData } = useSWR(
        '/api/notifications/unread-count',
        fetcher,
        { revalidateOnFocus: false }
    );

    const notifications = notificationsData?.data || [];
    const unreadCount = unreadData?.data?.unread_count || 0;

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            mutateNotifications();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            mutateNotifications();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <div className="notifications-page">
            {/* Hero Section */}
            <section className="hero-small">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Notifications</h1>
                    <p>Stay updated with your job applications and new opportunities</p>
                </motion.div>
            </section>

            <div className="notifications-container">
                {/* Header with actions */}
                <div className="notifications-header">
                    <div className="unread-badge">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </div>
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </button>
                    )}
                </div>

                {error && (
                    <div className="error-fallback">
                        <h3>Unable to load notifications</h3>
                        <p>Please try again later.</p>
                        <button onClick={() => window.location.reload()}>Retry</button>
                    </div>
                )}

                {isLoading ? (
                    <div className="notifications-list">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="notification-skeleton">
                                <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                <div style={{ flex: 1 }}>
                                    <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '8px' }} />
                                    <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '8px' }} />
                                    <div className="skeleton" style={{ width: '30%', height: '12px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <motion.div 
                        className="empty-state"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="empty-state-icon">🔔</div>
                        <h3>No notifications yet</h3>
                        <p>We'll notify you when there are updates</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="notifications-list"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {notifications.map((notification) => (
                            <NotificationCard 
                                key={notification.id} 
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            <style jsx>{`
                .notifications-page {
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

                .notifications-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 32px 20px;
                }

                .notifications-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 16px 20px;
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border-radius: var(--radius-xl);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .unread-badge {
                    font-weight: 600;
                    color: var(--color-primary-light);
                }

                .mark-all-btn {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--color-primary);
                    border-radius: var(--radius-md);
                    color: var(--color-primary-light);
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .mark-all-btn:hover {
                    background: var(--color-primary);
                    color: white;
                }

                .notifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .notification-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: var(--gradient-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: var(--radius-xl);
                    cursor: pointer;
                    transition: all var(--transition-normal);
                    position: relative;
                }

                .notification-card:hover {
                    transform: translateX(4px);
                    border-color: rgba(124, 58, 237, 0.2);
                }

                .notification-card.unread {
                    background: linear-gradient(145deg, rgba(124, 58, 237, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%);
                }

                .notification-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 50%;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .notification-content {
                    flex: 1;
                    min-width: 0;
                }

                .notification-content h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .notification-content p {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    margin-bottom: 8px;
                    line-height: 1.5;
                }

                .notification-time {
                    font-size: 0.75rem;
                    color: var(--text-tertiary);
                }

                .unread-dot {
                    width: 10px;
                    height: 10px;
                    background: var(--color-primary);
                    border-radius: 50%;
                    position: absolute;
                    top: 20px;
                    right: 20px;
                }

                /* Skeleton */
                .notification-skeleton {
                    display: flex;
                    gap: 16px;
                    padding: 20px;
                    background: var(--gradient-card);
                    border-radius: var(--radius-xl);
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

                @media (max-width: 768px) {
                    .hero-content h1 {
                        font-size: 2rem;
                    }

                    .notifications-header {
                        flex-direction: column;
                        gap: 12px;
                    }
                }
            `}</style>
        </div>
    );
}

