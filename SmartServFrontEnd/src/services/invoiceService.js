import api from '../api/axiosConfig';

const normalizeInvoice = (inv) => {
  if (!inv) return inv;
  const base = Number(inv.baseAmount || 0);
  const tax = Number(inv.taxAmount || 0);
  const total = inv.totalAmount !== undefined && inv.totalAmount !== null && Number(inv.totalAmount) > 0
    ? Number(inv.totalAmount)
    : (base + tax);

  return {
    ...inv,
    totalAmount: total,
    customerName: inv.customerName || inv.customer?.userName || 'Customer'
  };
};

export const invoiceService = {
  generate: async (jobCardId) => {
    const response = await api.post(`/invoices/generate/job_card/${jobCardId}`);
    return normalizeInvoice(response.data);
  },

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return normalizeInvoice(response.data);
  },

  getAll: async () => {
    try {
      const response = await api.get('/invoices');
      const data = response.data || [];
      return data.map(normalizeInvoice);
    } catch (error) {
      return [];
    }
  },

  getByCustomer: async (customerId) => {
    if (!customerId) return [];
    try {
      const response = await api.get(`/invoices/customer/${customerId}`);
      const data = response.data || [];
      return data.map(normalizeInvoice);
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
