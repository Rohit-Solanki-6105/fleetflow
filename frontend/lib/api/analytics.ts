// Analytics API
import apiClient from './client';

export const analyticsApi = {
  // Get dashboard analytics
  async getDashboard() {
    const response = await apiClient.get('/analytics/dashboard/');
    return response.data;
  },

  // Get fleet performance
  async getFleetPerformance(days: number = 30) {
    const response = await apiClient.get('/analytics/fleet-performance/', {
      params: { days },
    });
    return response.data;
  },

  // Get financial reports
  async getFinancial(days: number = 90) {
    const response = await apiClient.get('/analytics/financial/', {
      params: { days },
    });
    return response.data;
  },

  // Get driver performance
  async getDriverPerformance(days: number = 30) {
    const response = await apiClient.get('/analytics/driver-performance/', {
      params: { days },
    });
    return response.data;
  },
};
