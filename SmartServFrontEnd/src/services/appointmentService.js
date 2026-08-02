import api from '../api/axiosConfig';

const normalizeAppointment = (app) => {
  if (!app) return app;
  const brand = app.brand || app.vehicle?.brand || app.vehicle?.make || '';
  const model = app.model || app.vehicle?.model || '';
  const licensePlate = app.licensePlate || app.vehicle?.licensePlate || '';
  const description = app.problemDescription || app.description || app.serviceType || '';

  return {
    ...app,
    brand,
    make: brand,
    model,
    licensePlate,
    description,
    problemDescription: description,
    vehicle: app.vehicle || {
      brand,
      make: brand,
      model,
      licensePlate,
      color: app.color || app.vehicle?.color || ''
    }
  };
};

export const appointmentService = {
  getAll: async () => {
    try {
      const response = await api.get('/appointments');
      const list = response.data || [];
      return list.map(normalizeAppointment);
    } catch (error) {
      return [];
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return normalizeAppointment(response.data);
  },
  
  getByCustomerId: async (customerId) => {
    if (!customerId) return [];
    try {
      const response = await api.get(`/appointments/customer/${customerId}`);
      const list = response.data || [];
      return list.map(normalizeAppointment);
    } catch (error) {
      console.warn('Customer has no appointments or fetch error:', error);
      return [];
    }
  },

  getPending: async () => {
    try {
      const response = await api.get('/appointments/pending');
      const list = response.data || [];
      return list.map(normalizeAppointment);
    } catch (error) {
      return [];
    }
  },

  approve: async (id) => {
    const response = await api.put(`/appointments/${id}/approve`);
    return normalizeAppointment(response.data);
  },

  reject: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/reject`, { rejectionReason: reason });
    return normalizeAppointment(response.data);
  },
  
  create: async (data) => {
    const response = await api.post('/appointments', data);
    return normalizeAppointment(response.data);
  },
  
  updateStatus: async (id, status) => {
    const response = await api.put(`/appointments/${id}/status?status=${status}`);
    return normalizeAppointment(response.data);
  },
  
  delete: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }
};
