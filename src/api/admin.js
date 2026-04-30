import api from './client';

/**
 * Admin Facade Service
 * Combines admin capabilities from different microservices
 */

// --- USER MANAGEMENT (auth-service) ---
export const getAllUsers = () => 
  api.get('/auth/admin/users');

export const getUsersByRole = (role) => 
  api.get(`/auth/admin/users/role/${role}`);

export const deactivateUser = (userId) => 
  api.put(`/auth/admin/users/${userId}/deactivate`);

export const reactivateUser = (userId) => 
  api.put(`/auth/admin/users/${userId}/reactivate`);

export const deleteUser = (userId) => 
  api.delete(`/auth/admin/users/${userId}`);

export const updateUserRole = (userId, role) => 
  api.put(`/auth/admin/users/${userId}/role`, null, { params: { role } });

// --- CONTENT MODERATION (post/comment services) ---
export const deleteAnyPost = (postId) => 
  api.delete(`/posts/${postId}`);

export const deleteAnyComment = (commentId) => 
  api.delete(`/comments/${commentId}`);

// --- BROADCAST & SYSTEM (notification-service) ---
export const broadcastNotification = (data) => 
  api.post('/notifications/bulk', data);

export const sendSystemEmail = (data) => 
  api.post('/notifications/email-alert', data);

export const getPlatformNotificationLogs = () => 
  api.get('/notifications/all');

// --- SEARCH & TRENDING (search-service) ---
export const getTrendingHashtags = (limit = 10) => 
  api.get('/hashtags/trending', { params: { limit } });

// --- ANALYTICS ---
export const getPlatformStats = () => 
  api.get('/auth/admin/users'); // Fallback: count total users

// --- ALIASES FOR BACKWARD COMPATIBILITY ---
export const getAllPosts = () => api.get('/posts/public');
export const getAllStories = () => api.get('/media/stories/all'); // Fetch all platform stories for stats
export const removePost = deleteAnyPost;
export const getAllComments = () => api.get('/comments/post/0'); 
export const removeComment = deleteAnyComment;
export const suspendUser = deactivateUser;
export const getReports = () => api.get('/reports/all');
export const resolveReport = (id, action) => api.put(`/reports/${id}/resolve`, null, { params: { action } });
export const getReportStats = () => api.get('/reports/stats');
export const deleteAllReports = () => api.delete('/reports/all');
export const sendPlatformNotification = (message, targetUserIds) => 
  broadcastNotification({ message: message, recipientIds: targetUserIds, type: 'SYSTEM' });
