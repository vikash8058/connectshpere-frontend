import api from './client';

/**
 * Like Service APIs (Polymorphic Reactions)
 * Microservice: like-service
 */

export const reactToTarget = (data) => 
  api.post('/likes', data);

export const removeReaction = (targetId, targetType) => 
  api.delete('/likes', { params: { targetId, targetType } });

export const changeReaction = (data) => 
  api.put('/likes/change', data);

export const checkHasReacted = (targetId, targetType) => 
  api.get('/likes/has', { params: { targetId, targetType } });

export const getUserReaction = (targetId, targetType) =>
  api.get('/likes/my', { params: { targetId, targetType } });

export const getReactionsByTarget = (targetId, targetType) => 
  api.get('/likes/target', { params: { targetId, targetType } });

export const getReactionsByUser = (userId) => 
  api.get(`/likes/user/${userId}`);

export const getReactionCount = (targetId, targetType) => 
  api.get('/likes/count', { params: { targetId, targetType } });

export const getReactionCountByType = (targetId, targetType, reactionType) => 
  api.get('/likes/count/type', { params: { targetId, targetType, reactionType } });

export const getReactionSummary = (targetId, targetType) => 
  api.get('/likes/summary', { params: { targetId, targetType } });

// --- ALIASES FOR BACKWARD COMPATIBILITY ---
export const likeTarget = reactToTarget;
export const unlikeTarget = removeReaction;
