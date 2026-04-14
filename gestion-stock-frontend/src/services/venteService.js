import api from './api';

const venteService = {
  // Create new sale
  createVente: async (data) => {
    try {
      const response = await api.post('/ventes', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get all sales
  getAllVentes: async () => {
    try {
      const response = await api.get('/ventes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Get sales by product ID
  getVentesByProduct: async (produitId) => {
    try {
      const response = await api.get(`/ventes`, {
        params: { produit_id: produitId }
      });
      console.log('📦 Sales for product', produitId, ':', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching sales:', error);
      throw error;
    }
  },
  
  // Get sale by ID
  getVenteById: async (id) => {
    try {
      const response = await api.get(`/ventes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete sale
  deleteVente: async (id) => {
    try {
      const response = await api.delete(`/ventes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default venteService;