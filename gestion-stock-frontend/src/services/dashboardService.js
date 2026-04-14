import api from './api';

const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      
      // Backend returns { success: true, data: {...} }
      // We need to return response.data.data
      return response.data.data; // ✅ هاد السطر مهم بزاف!
      
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  },
};

export default dashboardService;