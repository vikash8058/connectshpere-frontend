import api from './client';

/**
 * Auth Service APIs
 * Microservice: auth-service
 */

// --- PUBLIC ---

export const register = (data) => 
  api.post('/auth/register', data);

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const verifyOtp = (email, otpCode, otpType = 'EMAIL_VERIFICATION') =>
  api.post('/auth/verify-otp', { email, otpCode, otpType });

export const resendOtp = (email, otpType = 'EMAIL_VERIFICATION') =>
  api.post('/auth/resend-otp', null, { params: { email, otpType } });

export const forgotPassword = (email) => 
  api.post('/auth/forgot-password', { email });

export const resetPassword = (email, newPassword) => 
  api.post('/auth/reset-password', { email, newPassword });

export const searchUsers = (query) =>
  api.get('/auth/search', { params: { query } });

export const getUserById = (userId) => 
  api.get(`/auth/users/${userId}`);

// --- PROTECTED (Authenticated) ---

export const logout = () => 
  api.post('/auth/logout');

export const getOwnProfile = () => 
  api.get('/auth/profile');

export const updateOwnProfile = (data) => 
  api.put('/auth/profile', data);

export const changeOwnPassword = (data) => 
  api.put('/auth/password', data);

export const setInitialPassword = (data) =>
  api.post('/auth/set-password', data);

export const refreshToken = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken });

// --- OAUTH ---

export const getGoogleOAuthUrl = () =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/oauth2/authorization/google`;

export const getGithubOAuthUrl = () =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/oauth2/authorization/github`;

// --- ADMIN ONLY ---

export const adminGetAllUsers = () => 
  api.get('/auth/admin/users');

export const adminGetUsersByRole = (role) => 
  api.get(`/auth/admin/users/role/${role}`);

export const adminDeactivateUser = (userId) => 
  api.put(`/auth/admin/users/${userId}/deactivate`);

export const adminReactivateUser = (userId) => 
  api.put(`/auth/admin/users/${userId}/reactivate`);

export const adminDeleteUser = (userId) => 
  api.delete(`/auth/admin/users/${userId}`);

export const adminUpdateUserRole = (userId, role) => 
  api.put(`/auth/admin/users/${userId}/role`, null, { params: { role } });

// --- ALIASES FOR BACKWARD COMPATIBILITY ---
export const getProfile = getUserById;
export const updateProfile = (userId, data) => updateOwnProfile(data);
export const changePassword = (userId, data) => changeOwnPassword(data);
export const deactivateAccount = (userId) => 
  api.post(`/auth/deactivate/${userId}`);
