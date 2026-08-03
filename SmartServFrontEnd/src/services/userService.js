import api from '../api/axiosConfig';

const normalizeUser = (u) => {
  if (!u) return u;
  const targetId = u.userId || u.id;
  return {
    ...u,
    id: targetId,
    userId: targetId,
    role: u.userRole || u.role,
    userRole: u.userRole || u.role
  };
};

export const userService = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      const list = response.data || [];
      return list.map(normalizeUser);
    } catch (e) {
      return [];
    }
  },

  getCustomers: async () => {
    try {
      const response = await api.get('/users/customers');
      const list = response.data || [];
      return list.map(normalizeUser);
    } catch (e) {
      return [];
    }
  },

  getMechanicsUnderManager: async (managerId) => {
    if (!managerId) return [];
    try {
      const response = await api.get(`/users/managers/${managerId}/mechanics`);
      const list = response.data || [];
      return list.map(normalizeUser);
    } catch (e) {
      return [];
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return normalizeUser(response.data);
  },
  
  create: async (data) => {
    const response = await api.post('/users', data);
    return normalizeUser(response.data);
  },
  
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return normalizeUser(response.data);
  },
  
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};
