// routes/notifications.js - Notifications routes
const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', notificationsController.getNotifications);

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationsController.markAsRead);

// Mark all as read
router.put('/read-all', notificationsController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationsController.deleteNotification);

// Delete all read notifications
router.delete('/', notificationsController.deleteAllRead);

// Preferences
router.get('/preferences', notificationsController.getPreferences);
router.put('/preferences', notificationsController.updatePreferences);

module.exports = router;
