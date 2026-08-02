import api from '../api/axiosConfig';

export const userService = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response.data || [];
    } catch (e) {
      return [];
    }
  },

  getCustomers: async () => {
    try {
      const response = await api.get('/users/customers');
      return response.data || [];
    } catch (e) {
      return [];
    }
  },

  getMechanicsUnderManager: async (managerId) => {
    if (!managerId) return [];
    try {
      const response = await api.get(`/users/managers/${managerId}/mechanics`);
      return response.data || [];
    } catch (e) {
      return [];
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
