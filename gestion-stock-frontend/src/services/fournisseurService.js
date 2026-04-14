import api from './api';

const fournisseurService = {
  // Get all fournisseurs
  getAllFournisseurs: async () => {
    const response = await api.get('/fournisseurs');
    return response.data;
  },

  // Get fournisseur by ID
  getFournisseur: async (id) => {
    const response = await api.get(`/fournisseurs/${id}`);
    return response.data;
  },

  // Create new fournisseur
  createFournisseur: async (data) => {
    const response = await api.post('/fournisseurs', data);
    return response.data;
  },

  // Update fournisseur
  updateFournisseur: async (id, data) => {
    const response = await api.put(`/fournisseurs/${id}`, data);
    return response.data;
  },

  // Delete fournisseur
  deleteFournisseur: async (id) => {
    const response = await api.delete(`/fournisseurs/${id}`);
    return response.data;
  },
};

export default fournisseurService;
