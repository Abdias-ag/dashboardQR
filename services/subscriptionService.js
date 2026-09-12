'use strict';

import api from '../lib/api';

const subscriptionService = {
  async getMySubscription() {
    const response = await api.get('/subscriptions/my');
    return response.data;
  },

  async getSubscriptionHistory() {
    const response = await api.get('/subscriptions/history');
    return response.data;
  },

  async upgradePlan(planData) {
    const response = await api.post('/subscriptions/upgrade', planData);
    return response.data;
  },

  async getPlans() {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  async getAllSubscriptions(params) {
    const response = await api.get('/subscriptions/admin', { params });
    return response.data;
  },

  async adminChangePlan(userId, plan) {
    const response = await api.post('/subscriptions/admin/change-plan', { userId, plan });
    return response.data;
  },
};

export default subscriptionService;
