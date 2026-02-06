import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response:`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API] Error:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  me: () => api.get('/auth/me'),
  devLogin: () => api.post('/auth/dev-login'),
  logout: () => api.post('/auth/logout'),
  google: () => {
    window.location.href = `${API_URL}/auth/google`;
  }
};

// Sites API
export const sitesAPI = {
  list: () => api.get('/sites'),
  get: (id) => api.get(`/sites/${id}`),
  create: (data) => api.post('/sites', data),
  update: (id, data) => api.put(`/sites/${id}`, data),
  delete: (id) => api.delete(`/sites/${id}`),
  summary: () => api.get('/sites/summary/all')
};

// Analytics API
export const analyticsAPI = {
  site: (siteId, params) => api.get(`/analytics/site/${siteId}`, { params }),
  overview: () => api.get('/analytics/overview'),
  sources: (siteId) => api.get(`/analytics/sources/${siteId}`),
  pages: (siteId) => api.get(`/analytics/pages/${siteId}`),
  refresh: (siteId) => api.post(`/analytics/refresh/${siteId}`)
};

// Search Console API
export const searchconsoleAPI = {
  sites: () => api.get('/searchconsole/sites'),
  queries: (params) => api.get('/searchconsole/queries', { params }),
  pages: (params) => api.get('/searchconsole/pages', { params }),
  overview: () => api.get('/searchconsole/overview'),
  trends: (params) => api.get('/searchconsole/trends', { params }),
  addSite: (data) => api.post('/searchconsole/sites', data),
  removeSite: (siteUrl) => api.delete(`/searchconsole/sites/${encodeURIComponent(siteUrl)}`)
};

// Dashboard API
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  health: () => api.get('/dashboard/health'),
  alerts: () => api.get('/dashboard/alerts'),
  quickStats: () => api.get('/dashboard/quick-stats')
};
