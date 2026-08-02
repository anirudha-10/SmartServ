import api from '../api/axiosConfig';

export const invoiceService = {
  generate: async (jobCardId) => {
    const response = await api.post(`/invoices/generate/job_card/${jobCardId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  getAll: async () => {
    try {
      const response = await api.get('/invoices');
      return response.data || [];
    } catch (error) {
      return [];
    }
  },

  getByCustomer: async (customerId) => {
    if (!customerId) return [];
    try {
      const response = await api.get(`/invoices/customer/${customerId}`);
      return response.data || [];
    } catch (error) {
      console.warn('Customer has no invoices or fetch error:', error);
      return [];
    }
  },

  createPaymentOrder: async (id) => {
    const response = await api.post(`/invoices/${id}/create_payment_order`);
    return response.data;
  },

  verifyPayment: async (id, payload) => {
    const response = await api.post(`/invoices/${id}/verify_payment`, payload);
    return response.data;
  },

  getStats: async () => {
    const [rev, count, paid, pending] = await Promise.all([
      api.get('/invoices/stats/total_revenue').catch(() => ({ data: 0 })),
      api.get('/invoices/stats/total_count').catch(() => ({ data: 0 })),
      api.get('/invoices/stats/paid_count').catch(() => ({ data: 0 })),
      api.get('/invoices/stats/pending_count').catch(() => ({ data: 0 })),
    ]);

    return {
      revenue: rev.data || 0,
      totalCount: count.data || 0,
      paidCount: paid.data || 0,
      pendingCount: pending.data || 0
    };
  }
};
