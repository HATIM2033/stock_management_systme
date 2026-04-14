import api from './api';

const productService = {
  // Get all products with categories and fournisseurs
  getAllProducts: async () => {
    try {
      const response = await api.get('/produits');
      console.log('📦 productService response:', response);
      return response.data; // ← Return response.data directly
    } catch (error) {
      console.error('❌ productService error:', error);
      throw error;
    }
  },

  // Get product by ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/produits/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create product with FormData for image upload
  createProduct: async (formData) => {
    try {
      const response = await api.post('/produits', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update product with FormData (POST with _method: PUT)
  updateProduct: async (id, formData) => {
    try {
      formData.append('_method', 'PUT');
      const response = await api.post(`/produits/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/produits/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await api.get('/produits/search', {
        params: { nom: query }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default productService;