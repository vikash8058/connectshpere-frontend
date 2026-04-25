import api from './client';

/**
 * Media & Story Service APIs
 * Microservice: media-service
 */

// --- MEDIA UPLOAD ---

/**
 * Uploads a file (Image/Video).
 * @param {File} file - The file object from input[type="file"]
 * @returns {Promise} - Resolves to { url, mediaId, ... }
 */
export const uploadMedia = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getMediaById = (mediaId) => 
  api.get(`/media/${mediaId}`);

export const getMediaByPost = (postId) => 
  api.get(`/media/post/${postId}`);

export const deleteMedia = (mediaId) => 
  api.delete(`/media/${mediaId}`);

// --- STORIES ---

export const createStory = (data) => 
  api.post('/stories', data);

export const getStoriesFeed = (authorIds) => 
  api.get('/stories/feed', { params: { authorIds: authorIds.join(',') } });

export const viewStory = (storyId) => 
  api.get(`/stories/${storyId}/view`);

export const getStoriesByUser = (authorId) => 
  api.get(`/stories/user/${authorId}`);

export const deleteStory = (storyId) => 
  api.delete(`/stories/${storyId}`);
