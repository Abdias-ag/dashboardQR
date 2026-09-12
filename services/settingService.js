'use strict';

import api from '../lib/api';

const settingService = {
  async getSettings() {
    const response = await api.get('/settings');
    return response.data;
  },

  async updateSettings(settingsData) {
    const response = await api.put('/settings', settingsData);
    return response.data;
  }
};

export default settingService;
