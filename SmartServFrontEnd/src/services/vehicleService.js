import api from '../api/axiosConfig';

export const vehicleService = {
  getAll: async () => {
    try {
      const response = await api.get('/vehicles');
      const list = response.data || [];
      return list.map(v => ({ ...v, id: v.vehicleId || v.id, vehicleId: v.vehicleId || v.id, make: v.brand || v.make }));
    } catch (error) {
      return [];
    }
  },
  
  getByCustomerId: async (customerId) => {
    if (!customerId) return [];
    try {
      const response = await api.get(`/vehicles/customer/${customerId}`);
      const list = response.data || [];
      return list.map(v => ({ ...v, id: v.vehicleId || v.id, vehicleId: v.vehicleId || v.id, make: v.brand || v.make }));
    } catch (error) {
      console.warn('Customer has no vehicles or fetch error:', error);
      return [];
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    const data = response.data;
    if (data) {
      const vId = data.vehicleId || data.id || id;
      return { ...data, id: vId, vehicleId: vId, make: data.brand || data.make };
    }
    return data;
  },
  
  create: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  }
};
