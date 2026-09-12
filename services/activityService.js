'use strict';

import api from '../lib/api';

const activityService = {
  async getActivityLog(params) {
    const response = await api.get('/users/admin/activity', { params });
    return response.data;
  },

  async getActivityStats() {
    const response = await api.get('/users/admin/activity/stats');
    return response.data;
  },
};

export default activityService;
