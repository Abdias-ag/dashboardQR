'use strict';

import api from '../lib/api';

const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(formData) {
    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  },

  async deleteAccount(password) {
    const response = await api.delete('/users/profile', { data: { password } });
    return response.data;
  },

  async getAllUsers(params) {
    const response = await api.get('/users/admin/users', { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/admin/users/${id}`);
    return response.data;
  },

  async updateUserStatus(id, status) {
    const response = await api.patch(`/users/admin/users/${id}/status`, { status });
    return response.data;
  },

  async verifyUserEmail(id) {
    const response = await api.patch(`/users/admin/users/${id}/verify-email`);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/admin/users/${id}`);
    return response.data;
  }
};

export default userService;
