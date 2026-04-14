import api from './api';

const alertService = {
  // Get all alerts
  getAllAlerts: async () => {
    try {
      const response = await api.get('/alertes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get alert by ID
  getAlertById: async (id) => {
    try {
      const response = await api.get(`/alertes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark alert as read
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/alertes/${id}/read`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark all alerts as read
  markAllAsRead: async () => {
    try {
      const response = await api.post('/alertes/read-all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete alert
  deleteAlert: async (id) => {
    try {
      const response = await api.delete(`/alertes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default alertService;