import api from '../api/axiosConfig';

const normalizeItem = (item) => {
  if (!item) return item;
  const sku = item.skuCode || item.sku || 'N/A';
  const qty = item.stockQuantity !== undefined && item.stockQuantity !== null 
    ? item.stockQuantity 
    : (item.quantityAvailable !== undefined && item.quantityAvailable !== null ? item.quantityAvailable : 0);
  const price = item.currentPrice !== undefined && item.currentPrice !== null 
    ? item.currentPrice 
    : (item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice : 0);

  return {
    ...item,
    skuCode: sku,
    sku: sku,
    stockQuantity: Number(qty),
    quantityAvailable: Number(qty),
    currentPrice: Number(price),
    unitPrice: Number(price)
  };
};

export const inventoryService = {
  getAll: async () => {
    try {
      const response = await api.get('/inventory');
      const data = response.data || [];
      return data.map(normalizeItem);
    } catch (e) {
      return [];
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return normalizeItem(response.data);
  },
  
  create: async (data) => {
    const payload = {
      itemName: data.itemName,
      skuCode: data.skuCode || data.sku,
      currentPrice: Number(data.currentPrice || data.unitPrice),
      stockQuantity: Number(data.stockQuantity || data.quantityAvailable)
    };
    const response = await api.post('/inventory', payload);
    return normalizeItem(response.data);
  },
  
  update: async (id, data) => {
    const payload = {
      itemName: data.itemName,
      currentPrice: Number(data.currentPrice || data.unitPrice),
      stockQuantity: Number(data.stockQuantity || data.quantityAvailable)
    };
    const response = await api.put(`/inventory/${id}`, payload);
    return normalizeItem(response.data);
  },
  
  delete: async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  }
};
