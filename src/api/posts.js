import api from './client';

/**
 * Post Service APIs
 * Microservice: post-service
 */

// --- PUBLIC ---

export const getPublicPosts = () => 
  api.get('/posts/public');

export const getPostById = (postId) => 
  api.get(`/posts/${postId}`);

export const getPostsByUser = (authorId) => 
  api.get(`/posts/user/${authorId}`);

export const searchPosts = (keyword) => 
  api.get('/posts/search', { params: { keyword } });

export const getPostCount = (authorId) => 
  api.get(`/posts/count/${authorId}`);

// --- PROTECTED ---

export const createPost = (data) => 
  api.post('/posts', data);

export const updatePost = (postId, data) => 
  api.put(`/posts/${postId}`, data);

export const deletePost = (postId) => 
  api.delete(`/posts/${postId}`);

export const changeVisibility = (postId, visibility) => 
  api.patch(`/posts/${postId}/visibility`, null, { params: { visibility } });

export const incrementShareCount = (postId) => 
  api.post(`/posts/${postId}/shares/increment`);

export const getNewsFeed = () => 
  api.get('/posts/feed');
