import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://military-management-nyce.vercel.app/api';

console.log('🌐 API Config Debug - API_BASE_URL:', API_BASE_URL);
console.log('🌐 API Config Debug - VITE_API_URL env var:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage instead of Redux store
    const token = localStorage.getItem('token');
    
    console.log('🌐 API Request Debug - Making request to:', config.baseURL + config.url);
    console.log('🌐 API Request Debug - Method:', config.method);
    console.log('🌐 API Request Debug - Params:', config.params);
    console.log('🌐 API Request Debug - Token present:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('🌐 API Request Debug - Request error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors and token expiration
api.interceptors.response.use(
  (response) => {
    console.log('🌐 API Response Debug - Response received from:', response.config.url);
    console.log('🌐 API Response Debug - Status:', response.status);
    console.log('🌐 API Response Debug - Data:', response.data);
    return response;
  },
  (error) => {
    console.error('🌐 API Response Debug - Response error:', error);
    console.error('🌐 API Response Debug - Error status:', error.response?.status);
    console.error('🌐 API Response Debug - Error data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🌐 API Response Debug - 401 error, clearing localStorage and redirecting');
      // Clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  searchUsers: (params) => api.get('/auth/users/search', { params })
};

export const userService = {
  getAll: () => api.get('/auth/users'),
  getById: (id) => api.get(`/auth/users/${id}`),
  update: (id, userData) => api.put(`/auth/users/${id}`, userData),
  delete: (id) => api.delete(`/auth/users/${id}`)
};

export const dashboardService = {
  getMetrics: (params) => api.get('/dashboard/metrics', { params }),
  getDepartmentSummary: (params) => api.get('/dashboard/departments', { params }),
  getRecentActivities: (params) => api.get('/dashboard/activities', { params }),
  getNetMovementDetails: (params) => api.get('/dashboard/net-movement', { params })
};

export const transferService = {
  getAllTransfers: (params) => api.get('/transfers', { params }),
  getById: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  update: (id, data) => api.put(`/transfers/${id}`, data),
  delete: (id) => api.delete(`/transfers/${id}`),
  updateStatus: (id, status) => api.patch(`/transfers/${id}/status`, { status })
};

export const assignmentService = {
  getAllAssignments: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  getByPersonnel: (personnelId) => api.get(`/assignments/personnel/${personnelId}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  updateStatus: (id, status) => api.patch(`/assignments/${id}/status`, { status })
};

export const expenditureService = {
  getAllExpenditures: (params) => api.get('/expenditures', { params }),
  getById: (id) => api.get(`/expenditures/${id}`),
  getSummary: (params) => api.get('/expenditures/summary', { params }),
  create: (data) => api.post('/expenditures', data),
  update: (id, data) => api.put(`/expenditures/${id}`, data),
  delete: (id) => api.delete(`/expenditures/${id}`)
};

export const purchaseService = {
  getAllPurchases: (params) => api.get('/purchases', { params }),
  getById: (id) => api.get(`/purchases/${id}`),
  getAvailableEquipment: (params) => api.get('/purchases/available-equipment', { params }),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
  updateStatus: (id, status) => api.patch(`/purchases/${id}/status`, { status }),
  approve: (id) => api.patch(`/purchases/${id}/approve`)
};

export default api; 