'use strict';

import api from '../lib/api';

const analyticsService = {
  async getDashboardStats() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  async getAdminStats() {
    const response = await api.get('/analytics/admin');
    return response.data;
  }
};

export default analyticsService;
