import api from './client';

/**
 * Payment Service APIs
 * Microservice: payment-service
 */

export const createOrder = (planType) => 
  api.post('/payments/create-order', { planType });

export const verifyPayment = (verificationData) => 
  api.post('/payments/verify', verificationData);

export const getSubscriptionStatus = () => 
  api.get('/payments/subscription-status');
