// controllers/notificationsController.js - Notifications controller
const { query } = require('../config/database');
const logger = require('../utils/logger');

// Get user notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, type, unreadOnly } = req.query;

        let whereClause = 'WHERE n.user_id = $1';
        const values = [userId];
        let paramIndex = 2;

        if (type) {
            whereClause += ` AND n.type = $${paramIndex}`;
            values.push(type);
            paramIndex++;
        }

        if (unreadOnly === 'true') {
            whereClause += ' AND n.is_read = false';
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) FROM notifications n ${whereClause}`,
            values
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get unread count
        const unreadResult = await query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
            [userId]
        );
        const unreadCount = parseInt(unreadResult.rows[0].count);

        // Get paginated notifications
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const result = await query(`
            SELECT 
                n.id, n.type, n.title, n.message, n.data, n.is_read, n.created_at
            FROM notifications n
            ${whereClause}
            ORDER BY n.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...values, parseInt(limit), offset]);

        res.json({
            success: true,
            data: {
                notifications: result.rows,
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalCount,
                    totalPages: Math.ceil(totalCount / parseInt(limit))
                }
            }
        });
    } catch (error) {
        logger.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications'
        });
    }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
            [userId]
        );

        res.json({
            success: true,
            data: {
                unreadCount: parseInt(result.rows[0].count)
            }
        });
    } catch (error) {
        logger.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch unread count'
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await query(`
            UPDATE notifications 
            SET is_read = true 
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        logger.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read'
        });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await query(
            'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
            [userId]
        );

        logger.info(`All notifications marked as read for user: ${userId}`);

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        logger.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to mark notifications as read'
        });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        logger.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification'
        });
    }
};

// Delete all read notifications
exports.deleteAllRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await query(
            'DELETE FROM notifications WHERE user_id = $1 AND is_read = true',
            [userId]
        );

        logger.info(`Deleted ${result.rowCount} read notifications for user: ${userId}`);

        res.json({
            success: true,
            message: `Deleted ${result.rowCount} notifications`
        });
    } catch (error) {
        logger.error('Delete all read error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete notifications'
        });
    }
};

// Create notification (internal use)
exports.createNotification = async (userId, type, title, message, data = {}) => {
    try {
        await query(`
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES ($1, $2, $3, $4, $5)
        `, [userId, type, title, message, JSON.stringify(data)]);
    } catch (error) {
        logger.error('Create notification error:', error);
    }
};

// Get notification preferences (for user settings)
exports.getPreferences = async (req, res) => {
    try {
        const userId = req.user.id;

        // In a real app, this would be stored in a separate table
        // For now, return default preferences
        const preferences = {
            emailNotifications: true,
            jobAlerts: true,
            applicationUpdates: true,
            deadlineReminders: true,
            newCourses: true,
            frequency: 'daily'
        };

        res.json({
            success: true,
            data: preferences
        });
    } catch (error) {
        logger.error('Get preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch preferences'
        });
    }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // In a real app, this would be stored in a separate table
        logger.info(`Notification preferences updated for user: ${userId}`);

        res.json({
            success: true,
            message: 'Preferences updated successfully'
        });
    } catch (error) {
        logger.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update preferences'
        });
    }
};
