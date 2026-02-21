// Driver API
import apiClient from './client';

export interface Driver {
  id: number;
  driver_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  address?: string;
  license_number: string;
  license_type: string;
  license_expiry_date: string;
  license_state: string;
  hire_date: string;
  status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_TRIP' | 'SUSPENDED';
  safety_score: number;
  total_trips_completed: number;
  total_distance_km: number;
  is_license_valid: boolean;
  is_available_for_trip: boolean;
  days_until_license_expiry: number;
  completion_rate: number;
  notes?: string;
  photo?: string;
  created_at: string;
  updated_at: string;
}

export const driverApi = {
  // Get all drivers
  async getAll(params?: Record<string, any>) {
    const response = await apiClient.get('/drivers/', { params });
    return response.data.results || response.data;
  },

  // Get driver by ID
  async getById(id: number): Promise<Driver> {
    const response = await apiClient.get(`/drivers/${id}/`);
    return response.data;
  },

  // Create driver
  async create(data: Partial<Driver>): Promise<Driver> {
    const response = await apiClient.post('/drivers/', data);
    return response.data;
  },

  // Update driver
  async update(id: number, data: Partial<Driver>): Promise<Driver> {
    const response = await apiClient.patch(`/drivers/${id}/`, data);
    return response.data;
  },

  // Delete driver
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/drivers/${id}/`);
  },

  // Get available drivers
  async getAvailable() {
    const response = await apiClient.get('/drivers/available/');
    return response.data;
  },

  // Get drivers with expiring licenses
  async getExpiringLicenses(days: number = 30) {
    const response = await apiClient.get('/drivers/expiring_licenses/', {
      params: { days },
    });
    return response.data;
  },

  // Get driver stats
  async getStats() {
    const response = await apiClient.get('/drivers/stats/');
    return response.data;
  },

  // Suspend driver
  async suspend(id: number): Promise<Driver> {
    const response = await apiClient.post(`/drivers/${id}/suspend/`);
    return response.data;
  },

  // Reactivate driver
  async reactivate(id: number): Promise<Driver> {
    const response = await apiClient.post(`/drivers/${id}/reactivate/`);
    return response.data;
  },

  // Update safety score
  async updateSafetyScore(id: number, score: number): Promise<Driver> {
    const response = await apiClient.post(`/drivers/${id}/update_safety_score/`, {
      safety_score: score,
    });
    return response.data;
  },
};
