const API_BASE_URL = '/api';

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data && data.message ? data.message : `HTTP error ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Products API
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`);
    return handleResponse(res);
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(res);
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse(res);
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Stock Movement API
  async recordStockIn(stockData) {
    const res = await fetch(`${API_BASE_URL}/stock/in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData),
    });
    return handleResponse(res);
  },

  async recordStockOut(stockData) {
    const res = await fetch(`${API_BASE_URL}/stock/out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData),
    });
    return handleResponse(res);
  },

  async getStockHistory() {
    const res = await fetch(`${API_BASE_URL}/stock/history`);
    return handleResponse(res);
  },

  // Dashboard API
  async getDashboardStats() {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return handleResponse(res);
  },

  async getRecentMovements() {
    const res = await fetch(`${API_BASE_URL}/dashboard/recent-movements`);
    return handleResponse(res);
  },
};
