import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://military-management-nyce.vercel.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
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