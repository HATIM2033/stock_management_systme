import api from './api';

const saleService = {
  // Get all sales
  getAll: async (params = {}) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  // Get sale by ID
  getById: async (id) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  // Create new sale
  create: async (saleData) => {
    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // Update sale
  update: async (id, saleData) => {
    const response = await api.put(`/sales/${id}`, saleData);
    return response.data;
  },

  // Cancel sale
  cancel: async (id, reason) => {
    const response = await api.put(`/sales/${id}/cancel`, { reason });
    return response.data;
  },

  // Get sales by date range
  getByDateRange: async (startDate, endDate) => {
    const response = await api.get('/sales/date-range', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  },

  // Get today's sales
  getToday: async () => {
    const response = await api.get('/sales/today');
    return response.data;
  },

  // Get this week's sales
  getThisWeek: async () => {
    const response = await api.get('/sales/this-week');
    return response.data;
  },

  // Get this month's sales
  getThisMonth: async () => {
    const response = await api.get('/sales/this-month');
    return response.data;
  },

  // Get sales statistics
  getStats: async (period = 'month') => {
    const response = await api.get('/sales/stats', { params: { period } });
    return response.data;
  },

  // Get top selling products
  getTopProducts: async (limit = 10) => {
    const response = await api.get('/sales/top-products', {
      params: { limit }
    });
    return response.data;
  },

  // Search sales
  search: async (query) => {
    const response = await api.get('/sales/search', { params: { q: query } });
    return response.data;
  },

  // Generate invoice
  generateInvoice: async (saleId) => {
    const response = await api.get(`/sales/${saleId}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Send invoice by email
  sendInvoice: async (saleId, emailData) => {
    const response = await api.post(`/sales/${saleId}/send-invoice`, emailData);
    return response.data;
  },

  // Get sales by customer
  getByCustomer: async (customerId) => {
    const response = await api.get(`/sales/customer/${customerId}`);
    return response.data;
  },

  // Return items from sale
  returnItems: async (saleId, returnData) => {
    const response = await api.post(`/sales/${saleId}/return`, returnData);
    return response.data;
  },

  // Export sales
  export: async (format = 'csv', filters = {}) => {
    const response = await api.get('/sales/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default saleService;
