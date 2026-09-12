'use strict';

import api from '../lib/api';

const qrService = {
  async getQrCodes(params) {
    const response = await api.get('/qrcodes', { params });
    return response.data;
  },

  async getQrCode(id) {
    const response = await api.get(`/qrcodes/${id}`);
    return response.data;
  },

  async createQrCode(formData) {
    const response = await api.post('/qrcodes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateQrCode(id, formData) {
    const response = await api.put(`/qrcodes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async toggleActive(id) {
    const response = await api.patch(`/qrcodes/${id}/toggle`);
    return response.data;
  },

  async deleteQrCode(id) {
    const response = await api.delete(`/qrcodes/${id}`);
    return response.data;
  },

  async getAnalytics(id) {
    const response = await api.get(`/qrcodes/${id}/analytics`);
    return response.data;
  },

  async getPreview(params) {
    const response = await api.get('/qrcodes/preview', { params });
    return response.data;
  },

  async getAllQrCodes(params) {
    const response = await api.get('/qrcodes/admin', { params });
    return response.data;
  },

  async adminToggleQrCode(id) {
    const response = await api.patch(`/qrcodes/admin/${id}/toggle`);
    return response.data;
  },

  async adminUpdateQrCode(id, data) {
    const response = await api.patch(`/qrcodes/admin/${id}`, data);
    return response.data;
  },

  async adminDeleteQrCode(id) {
    const response = await api.delete(`/qrcodes/admin/${id}`);
    return response.data;
  },
};

export default qrService;

