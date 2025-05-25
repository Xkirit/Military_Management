import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  dashboardService, 
  transferService, 
  assignmentService, 
  expenditureService, 
  purchaseService,
  authService 
} from '../services/api';

// Query Keys
export const QUERY_KEYS = {
  DASHBOARD_METRICS: 'dashboardMetrics',
  DASHBOARD_ACTIVITIES: 'dashboardActivities',
  DASHBOARD_DEPARTMENTS: 'dashboardDepartments',
  DASHBOARD_NET_MOVEMENT: 'dashboardNetMovement',
  TRANSFERS: 'transfers',
  ASSIGNMENTS: 'assignments',
  EXPENDITURES: 'expenditures',
  PURCHASES: 'purchases',
  USERS: 'users',
};

// Dashboard Hooks
export const useDashboardMetrics = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_METRICS, params],
    queryFn: () => dashboardService.getMetrics(params),
    select: (response) => response.data,
  });
};

export const useDashboardActivities = (params = { limit: 20 }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_ACTIVITIES, params],
    queryFn: () => dashboardService.getRecentActivities(params),
    select: (response) => response.data,
  });
};

export const useDashboardDepartments = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_DEPARTMENTS, params],
    queryFn: () => dashboardService.getDepartmentSummary(params),
    select: (response) => response.data,
  });
};

export const useDashboardNetMovement = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_NET_MOVEMENT, params],
    queryFn: () => dashboardService.getNetMovementDetails(params),
    select: (response) => response.data,
    enabled: false, // Only fetch when explicitly triggered
  });
};

// Transfers Hooks
export const useTransfers = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TRANSFERS, params],
    queryFn: () => transferService.getAllTransfers(params),
    select: (response) => response.data,
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferService.create,
    onSuccess: () => {
      // Invalidate and refetch transfers data
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSFERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => transferService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSFERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useUpdateTransferStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => transferService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSFERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useDeleteTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transferService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSFERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

// Assignments Hooks
export const useAssignments = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ASSIGNMENTS, params],
    queryFn: () => assignmentService.getAllAssignments(params),
    select: (response) => response.data,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => assignmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useUpdateAssignmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => assignmentService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ASSIGNMENTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

// Expenditures Hooks
export const useExpenditures = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXPENDITURES, params],
    queryFn: () => expenditureService.getAllExpenditures(params),
    select: (response) => response.data,
  });
};

export const useCreateExpenditure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenditureService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENDITURES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useUpdateExpenditure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => expenditureService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENDITURES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useDeleteExpenditure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenditureService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPENDITURES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

// Purchases Hooks
export const usePurchases = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASES, params],
    queryFn: () => purchaseService.getAllPurchases(params),
    select: (response) => response.data,
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => purchaseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useUpdatePurchaseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => purchaseService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_METRICS] });
    },
  });
};

// Users Hooks
export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, params],
    queryFn: () => authService.searchUsers(params),
    select: (response) => response.data,
    enabled: !!params.search && params.search.length >= 2, // Only run when search has at least 2 characters
    staleTime: 30000, // Cache for 30 seconds
    cacheTime: 300000, // Keep in cache for 5 minutes
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
}; 