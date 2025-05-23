import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
};

// User/Personnel services
export const userService = {
  searchUsers: (params) => api.get('/auth/users/search', { params }),
  getAllUsers: () => api.get('/auth/users'),
};

// Dashboard services
export const dashboardService = {
  getMetrics: (params) => api.get('/dashboard/metrics', { params }),
  getDepartmentSummary: (params) => api.get('/dashboard/departments', { params }),
  getRecentActivities: (params) => api.get('/dashboard/activities', { params }),
  getNetMovementDetails: (params) => api.get('/dashboard/net-movement', { params }),
};

// Transfer services
export const transferService = {
  createTransfer: (data) => api.post('/transfers', data),
  getAllTransfers: () => api.get('/transfers'),
  getTransferById: (id) => api.get(`/transfers/${id}`),
  updateTransfer: (id, data) => api.put(`/transfers/${id}`, data),
  deleteTransfer: (id) => api.delete(`/transfers/${id}`),
  updateStatus: (id, status) => api.patch(`/transfers/${id}/status`, { status }),
};

// Assignment services
export const assignmentService = {
  createAssignment: (data) => api.post('/assignments', data),
  getAllAssignments: () => api.get('/assignments'),
  getAssignmentById: (id) => api.get(`/assignments/${id}`),
  getAssignmentsByPersonnel: (personnelId) => api.get(`/assignments/personnel/${personnelId}`),
  updateAssignment: (id, data) => api.put(`/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  updateStatus: (id, status) => api.patch(`/assignments/${id}/status`, { status }),
};

// Expenditure services
export const expenditureService = {
  createExpenditure: (data) => api.post('/expenditures', data),
  getAllExpenditures: (params) => api.get('/expenditures', { params }),
  getExpenditureById: (id) => api.get(`/expenditures/${id}`),
  getExpenditureSummary: (params) => api.get('/expenditures/summary', { params }),
  updateExpenditure: (id, data) => api.put(`/expenditures/${id}`, data),
  deleteExpenditure: (id) => api.delete(`/expenditures/${id}`),
  updateStatus: (id, status) => api.patch(`/expenditures/${id}/status`, { status }),
};

// Purchase services
export const purchaseService = {
  createPurchase: (data) => api.post('/purchases', data),
  getAllPurchases: (params) => api.get('/purchases', { params }),
  getAvailableEquipment: (params) => api.get('/purchases/available-equipment', { params }),
  getPurchaseById: (id) => api.get(`/purchases/${id}`),
  updatePurchase: (id, data) => api.put(`/purchases/${id}`, data),
  deletePurchase: (id) => api.delete(`/purchases/${id}`),
  updateStatus: (id, status) => api.patch(`/purchases/${id}/status`, { status }),
}; 