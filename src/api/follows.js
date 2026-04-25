import api from './client';

/**
 * Follow Service APIs
 * Microservice: follow-service
 */

// --- PROTECTED ---

export const followUser = (followeeId) => 
  api.post(`/follows/${followeeId}`);

export const unfollowUser = (followeeId) => 
  api.delete(`/follows/${followeeId}`);

export const checkIsFollowing = (followeeId) => 
  api.get(`/follows/check/${followeeId}`);

export const getFollowSuggestions = () => 
  api.get('/follows/suggestions');

// --- PUBLIC ---

export const getFollowers = (userId) => 
  api.get(`/follows/${userId}/followers`);

export const getFollowing = (userId) => 
  api.get(`/follows/${userId}/following`);

export const getFollowerCount = (userId) => 
  api.get(`/follows/${userId}/follower-count`);

export const getFollowingCount = (userId) => 
  api.get(`/follows/${userId}/following-count`);

export const getFollowCounts = (userId) => 
  api.get(`/follows/${userId}/counts`);

export const getMutualConnections = (userId) => 
  api.get(`/follows/${userId}/mutual`);
