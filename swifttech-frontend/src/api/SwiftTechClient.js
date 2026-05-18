/**
 * SwiftTechClient.js
 * Drop-in replacement that connects your frontend to the Express + PostgreSQL backend.
 * All existing calls like SwiftTech.entities.Product.list() keep working unchanged.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('swifttech_token');
const setToken = (t) => localStorage.setItem('swifttech_token', t);
const clearToken = () => localStorage.removeItem('swifttech_token');

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // 204 No Content
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `Request failed: ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
const auth = {
  async register({ email, password, name }) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  async login({ email, password }) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  async me() {
    return apiFetch('/auth/me');
  },

  async updateMe(updates) {
    return apiFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  logout(redirectUrl) {
    clearToken();
    if (redirectUrl) window.location.href = redirectUrl;
  },

  redirectToLogin(returnUrl) {
    // For a custom login page, change this path
    window.location.href = `/login${returnUrl ? `?redirect=${encodeURIComponent(returnUrl)}` : ''}`;
  },
};

// ── Generic entity factory ───────────────────────────────────────────────────
// Maps the old SwiftTech.entities.X.list/filter/create/update/delete calls
// to the matching REST endpoints.

function makeProductEntity() {
  return {
    // list(sortBy, limit)  →  GET /products?sort=&limit=&status=active
    async list(sortBy = '-created_date', limit = 100) {
      const params = new URLSearchParams({ sort: sortBy, limit });
      const data = await apiFetch(`/products?${params}`);
      return data.products ?? data;
    },

    // filter({ status, category, ... }, sortBy)  →  GET /products?...
    async filter(filters = {}, sortBy = '-created_date') {
      const params = new URLSearchParams({ sort: sortBy, limit: 200 });
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null) params.set(k, v);
      });
      const data = await apiFetch(`/products?${params}`);
      // Support filter({ id: uuid }) — single product lookup
      if (filters.id) {
        const list = data.products ?? data;
        return list.filter((p) => p.id === filters.id);
      }
      return data.products ?? data;
    },

    async get(id) {
      return apiFetch(`/products/${id}`);
    },

    async create(productData) {
      return apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
    },

    async update(id, updates) {
      return apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    async delete(id) {
      return apiFetch(`/products/${id}`, { method: 'DELETE' });
    },
  };
}

function makeCartItemEntity() {
  return {
    async list() {
      return apiFetch('/cart');
    },

    async create({ product_id, quantity = 1, product_name, product_price, product_image }) {
      return apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id, quantity, product_name, product_price, product_image }),
      });
    },

    async update(id, { quantity }) {
      return apiFetch(`/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
    },

    async delete(id) {
      return apiFetch(`/cart/${id}`, { method: 'DELETE' });
    },

    async clear() {
      return apiFetch('/cart/clear', { method: 'DELETE' });
    },
  };
}

function makeOrderEntity() {
  return {
    async list(sortBy = '-created_date') {
      const params = new URLSearchParams({ sort: sortBy });
      return apiFetch(`/orders?${params}`);
    },

    async get(id) {
      return apiFetch(`/orders/${id}`);
    },

    async create(orderData) {
      return apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    async updateStatus(id, status) {
      return apiFetch(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
  };
}

// ── File upload (replaces SwiftTech.integrations.Core.UploadFile) ─────────────
const integrations = {
  Core: {
    async UploadFile({ file }) {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data; // { file_url: '...', filename: '...' }
    },
  },
};

// ── Main export ───────────────────────────────────────────────────────────────
export const SwiftTech = {
  auth,
  integrations,
  entities: {
    Product: makeProductEntity(),
    CartItem: makeCartItemEntity(),
    Order: makeOrderEntity(),
  },
};
