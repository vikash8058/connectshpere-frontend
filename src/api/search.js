import api from './client';

/**
 * Search & Hashtag Service APIs
 * Microservice: search-service
 */

// --- SEARCH ---

export const searchGlobalPosts = (keyword) => 
  api.get('/search/posts', { params: { keyword } });

export const searchGlobalUsers = (query) => 
  api.get('/search/users', { params: { query } });

// --- HASHTAGS ---

export const getTrendingHashtags = (limit = 10) => 
  api.get('/hashtags/trending', { params: { limit } });

export const getPostsByHashtag = (tag) => 
  api.get(`/hashtags/${tag}/posts`);

export const getHashtagsForPost = (postId) => 
  api.get(`/hashtags/post/${postId}`);

export const autocompleteHashtags = (query) => 
  api.get('/hashtags/search', { params: { query } });

export const getHashtagPostCount = (tag) => 
  api.get(`/hashtags/${tag}/count`);
