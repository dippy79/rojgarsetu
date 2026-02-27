// frontend/pages/notifications/index.js - Notifications Page
import { useState } from 'react';
import useSWR from 'swr';
import { notificationsAPI } from '../../lib/api';

export default function Notifications() {
    const [filter, setFilter] = useState('all');
    const { data, error, mutate } = useSWR(
        `/api/notifications?${filter === 'unread' ? 'unreadOnly=true' : ''}`,
        () => notificationsAPI.getNotifications({ unreadOnly: filter === 'unread' ? true : undefined }).then(res => res.data),
        { revalidateOnFocus: false }
    );

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            mutate();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            mutate();
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationsAPI.deleteNotification(id);
            mutate();
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const notifications = data?.data?.notifications || [];
    const unreadCount = data?.data?.unreadCount || 0;

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'application_update': return '📋';
            case 'new_application': return '👤';
            case 'job_alert': return '🔔';
            case 'deadline': return '⏰';
            default: return '📢';
        }
    };

    return (
        <div className="notifications-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div>
                        <h1>Notifications</h1>
                        <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                    </div>
                    {unreadCount > 0 && (
                        <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    Unread {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </button>
            </div>

            {/* Notifications List */}
            <div className="notifications-list">
                {error ? (
                    <div className="error-message">
                        Failed to load notifications. Please try again.
                    </div>
                ) : !data ? (
                    <div className="loading">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔔</div>
                        <h3>No notifications</h3>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">{notification.title}</div>
                                <div className="notification-message">{notification.message}</div>
                                <div className="notification-time">
                                    {new Date(notification.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="notification-actions">
                                {!notification.is_read && (
                                    <button 
                                        className="action-btn mark-read"
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        Mark read
                                    </button>
                                )}
                                <button 
                                    className="action-btn delete"
                                    onClick={() => handleDelete(notification.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .notifications-page {
                    min-height: 100vh;
                    background: #f8fafc;
                }

                .page-header {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    padding: 32px;
                }

                .header-content {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .page-header h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .page-header p {
                    margin: 4px 0 0;
                    opacity: 0.9;
                }

                .mark-all-btn {
                    padding: 10px 20px;
                    background: white;
                    color: #4f46e5;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .mark-all-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .filters {
                    display: flex;
                    gap: 8px;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 24px 32px;
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
                    transition: all 0.2s;
                }

                .filter-btn.active {
                    background: #4f46e5;
                    color: white;
                    border-color: #4f46e5;
                }

                .badge {
                    background: #dc2626;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }

                .notifications-list {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 32px 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .notification-card {
                    display: flex;
                    gap: 16px;
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                }

                .notification-card.unread {
                    border-left: 4px solid #4f46e5;
                    background: #f8fafc;
                }

                .notification-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }

                .notification-icon {
                    font-size: 24px;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f3f4f6;
                    border-radius: 50%;
                }

                .notification-content {
                    flex: 1;
                }

                .notification-title {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 4px;
                }

                .notification-message {
                    color: #6b7280;
                    margin-bottom: 8px;
                }

                .notification-time {
                    font-size: 12px;
                    color: #9ca3af;
                }

                .notification-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .action-btn {
                    padding: 6px 12px;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .mark-read {
                    background: #e0e7ff;
                    color: #4f46e5;
                }

                .mark-read:hover {
                    background: #c7d2fe;
                }

                .delete {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .delete:hover {
                    background: #fecaca;
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
                    margin: 8px 0 0;
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
                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        text-align: center;
                    }

                    .notification-card {
                        flex-direction: column;
                    }

                    .notification-actions {
                        flex-direction: row;
                        justify-content: flex-end;
                    }
                }
            `}</style>
        </div>
    );
}
