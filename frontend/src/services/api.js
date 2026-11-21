import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to unwrap data from response envelope
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  // System Overview
  getOverview: () => apiClient.get('/overview'),

  // Routes
  getRoutes: (sortBy = 'reliability_score', order = 'desc') =>
    apiClient.get('/routes', { params: { sort_by: sortBy, order } }),
  
  getRouteDetail: (routeId) => apiClient.get(`/routes/${routeId}`),
  
  getRouteReliability: (routeId) => apiClient.get(`/routes/${routeId}/reliability`),
  
  getRouteStops: (routeId) => apiClient.get(`/routes/${routeId}/stops`),
  
  searchRoutes: (sourceStopId, destStopId) =>
    apiClient.get('/routes/search/query', {
      params: { source_stop_id: sourceStopId, dest_stop_id: destStopId },
    }),

  // Bus Stops
  getStops: (search = '', sortBy = 'average_delay_minutes', order = 'desc') =>
    apiClient.get('/stops', { params: { search: search || undefined, sort_by: sortBy, order } }),
  
  getStopDetail: (stopId) => apiClient.get(`/stops/${stopId}`),

  // Analytics
  getDelayAnalytics: (params = {}) => apiClient.get('/analytics/delay', { params }),
  
  getWeekdayAnalytics: (params = {}) => apiClient.get('/analytics/weekday', { params }),
  
  getTimePeriodAnalytics: (params = {}) => apiClient.get('/analytics/time-period', { params }),
  
  getTrendAnalytics: (params = {}) => apiClient.get('/analytics/trends', { params }),
  
  compareRoutes: (routesCommaSeparated) =>
    apiClient.get('/analytics/comparison', { params: { routes: routesCommaSeparated } }),
  
  getDelayDistribution: (params = {}) => apiClient.get('/analytics/distribution', { params }),

  // Public Insights
  getPublicInsights: () => apiClient.get('/insights'),

  // Reports
  getReportSummary: (routeId = null) =>
    apiClient.get('/reports/summary', { params: routeId ? { route_id: routeId } : {} }),
  
  downloadReportPdf: (routeId = null) => {
    const url = routeId ? `/api/reports/export/pdf?route_id=${encodeURIComponent(routeId)}` : '/api/reports/export/pdf';
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  downloadReportExcel: (routeId = null) => {
    const url = routeId ? `/api/reports/export/excel?route_id=${encodeURIComponent(routeId)}` : '/api/reports/export/excel';
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

export default api;
