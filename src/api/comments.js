import api from './client';

/**
 * Comment Service APIs
 * Microservice: comment-service
 */

// --- PUBLIC ---

export const getCommentsByPost = (postId) => 
  api.get(`/comments/post/${postId}`);

export const getTopLevelComments = (postId) => 
  api.get(`/comments/post/${postId}/top-level`);

export const getCommentById = (commentId) => 
  api.get(`/comments/${commentId}`);

export const getReplies = (commentId) => 
  api.get(`/comments/${commentId}/replies`);

export const getCommentCount = (postId) => 
  api.get(`/comments/count/${postId}`);

// --- PROTECTED ---

export const addComment = (data) => 
  api.post('/comments', data);

export const updateComment = (commentId, data) => 
  api.put(`/comments/${commentId}`, data);

export const deleteComment = (commentId) => 
  api.delete(`/comments/${commentId}`);

export const likeComment = (commentId) => 
  api.post(`/comments/${commentId}/like`);

export const unlikeComment = (commentId) => 
  api.post(`/comments/${commentId}/unlike`);

export const getCommentsByUser = (authorId) => 
  api.get(`/comments/user/${authorId}`);
