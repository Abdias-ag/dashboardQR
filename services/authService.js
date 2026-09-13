'use strict';

import api from '../lib/api';

const setAuthCookies = (accessToken, role) => {
  if (typeof document !== 'undefined') {
    document.cookie = `accessToken=${accessToken}; path=/; max-age=900; SameSite=Lax`;
    document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;
  }
};

const clearAuthCookies = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
  }
};

const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { data } = response.data;
    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthCookies(data.accessToken, data.user?.role || 'user');
    }
    return response.data;
  },

  async register(firstname, lastname, email, password) {
    const response = await api.post('/auth/register', { firstname, lastname, email, password });
    return response.data;
  },

  async verifyEmail(email, code) {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  async resendVerification(email) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  async logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    clearAuthCookies();
    try {
      await Promise.race([
        api.post('/auth/logout'),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (e) { /* silence */ }
  },

  async refreshToken(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    const { data } = response.data;
    if (data?.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setAuthCookies(data.accessToken, JSON.parse(localStorage.getItem('user') || '{}')?.role || 'user');
    }
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(email, code, newPassword) {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export default authService;

