import api from './client';

/**
 * Notification Service APIs
 * Microservice: notification-service
 */

// --- USER ENDPOINTS ---

export const getNotifications = (recipientId, isRead = null) => {
  const params = isRead !== null ? { isRead } : {};
  return api.get(`/notifications/recipient/${recipientId}`, { params });
};

export const getUnreadNotificationCount = (recipientId) => 
  api.get(`/notifications/recipient/${recipientId}/unread-count`);

export const markNotificationAsRead = (notificationId) => 
  api.post(`/notifications/${notificationId}/read`);

export const markAllNotificationsAsRead = (recipientId) => 
  api.post(`/notifications/recipient/${recipientId}/read-all`);

export const deleteNotification = (notificationId) => 
  api.delete(`/notifications/${notificationId}`);

// --- ADMIN ENDPOINTS ---

export const broadcastNotification = (data) => 
  api.post('/notifications/bulk', data);

export const sendEmailAlert = (data) => 
  api.post('/notifications/email-alert', data);

export const getAllNotifications = () => 
  api.get('/notifications/all');

export const getNotificationsByType = (type) => 
  api.get(`/notifications/type/${type}`);
