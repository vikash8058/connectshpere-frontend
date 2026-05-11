import api from './client';

// --- Follow ---
export const followUser = (followeeId) =>
  api.post(`/follows/${followeeId}`);

export const unfollowUser = (followeeId) =>
  api.delete(`/follows/${followeeId}`);

export const isFollowing = (followeeId) =>
  api.get(`/follows/check/${followeeId}`);

export const getFollowers = (userId) =>
  api.get(`/follows/${userId}/followers`);

export const getFollowing = (userId) =>
  api.get(`/follows/${userId}/following`);

export const getFollowerCount = (userId) =>
  api.get(`/follows/${userId}/follower-count`);

export const getFollowingCount = (userId) =>
  api.get(`/follows/${userId}/following-count`);

export const getMutualFollows = (userId) =>
  api.get(`/follows/${userId}/mutual`);

export const getSuggestedUsers = () =>
  api.get('/follows/suggestions');

// --- Notifications ---
export const getNotifications = (userId) =>
  api.get(`/notifications/recipient/${userId}`);

export const markAsRead = (notificationId) =>
  api.post(`/notifications/${notificationId}/read`);

export const markAllRead = (userId) =>
  api.post(`/notifications/recipient/${userId}/read-all`);

export const getUnreadCount = (userId) =>
  api.get(`/notifications/recipient/${userId}/unread-count`);

export const deleteNotification = (notificationId) =>
  api.delete(`/notifications/${notificationId}`);

export const getAllNotifications = () =>
  api.get('/notifications/all');

// Admin broadcast
export const sendBulkNotification = (userIds, message) =>
  api.post('/notifications/bulk', { userIds, message });

// --- Media ---
export const uploadMedia = (formData) =>
  api.post('/media/upload', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'ngrok-skip-browser-warning': 'true',
    },
  });

export const getMediaByPost = (postId) =>
  api.get(`/media/post/${postId}`);

export const deleteMedia = (mediaId) =>
  api.delete(`/media/${mediaId}`);

// --- Stories ---
export const createStory = (data) =>
  api.post('/media/stories', data);

export const getActiveStories = (authorIds = []) => 
  api.get('/media/stories/feed', { params: { authorIds: authorIds.join(',') } });

export const viewStory = (storyId) => api.get(`/media/stories/${storyId}/view`);

export const deleteStory = (storyId) => api.delete(`/media/stories/${storyId}`);

export const getStoriesByUser = (userId) =>
  api.get(`/media/stories/user/${userId}`);

export const getStoryViewers = (storyId) =>
  api.get(`/media/stories/${storyId}/viewers`);

// --- Search & Hashtags ---
export const searchPosts = (keyword) =>
  api.get('/search/posts', { params: { keyword } });

export const searchUsers = (query) =>
  api.get('/search/users', { params: { query } });

export const getTrendingHashtags = () => api.get('/hashtags/trending');

export const getPostsByHashtag = (tag) =>
  api.get(`/hashtags/${tag}/posts`);

export const getHashtagsForPost = (postId) =>
  api.get(`/hashtags/post/${postId}`);

export const searchHashtags = (query) =>
  api.get('/hashtags/search', { params: { query } });

// --- Reports ---
export const createReport = (data) =>
  api.post('/reports', data);
