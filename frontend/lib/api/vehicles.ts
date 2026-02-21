// Vehicle API
import apiClient from './client';

export interface Vehicle {
  id: number;
  vehicle_id: string;
  name: string;
  vehicle_type: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  max_capacity_kg: number;
  fuel_capacity_liters?: number;
  current_odometer_km: number;
  status: 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
  acquisition_cost?: number;
  acquisition_date?: string;
  notes?: string;
  is_available_for_trip: boolean;
  total_maintenance_cost: number;
  total_fuel_cost: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleStats {
  total: number;
  available: number;
  on_trip: number;
  in_shop: number;
  retired: number;
  by_type: Record<string, number>;
}

export const vehicleApi = {
  // Get all vehicles
  async getAll(params?: Record<string, any>) {
    const response = await apiClient.get('/vehicles/', { params });
    return response.data;
  },

  // Get vehicle by ID
  async getById(id: number): Promise<Vehicle> {
    const response = await apiClient.get(`/vehicles/${id}/`);
    return response.data;
  },

  // Create vehicle
  async create(data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.post('/vehicles/', data);
    return response.data;
  },

  // Update vehicle
  async update(id: number, data: Partial<Vehicle>): Promise<Vehicle> {
    const response = await apiClient.patch(`/vehicles/${id}/`, data);
    return response.data;
  },

  // Delete vehicle
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/vehicles/${id}/`);
  },

  // Get available vehicles
  async getAvailable() {
    const response = await apiClient.get('/vehicles/available/');
    return response.data;
  },

  // Get vehicle stats
  async getStats(): Promise<VehicleStats> {
    const response = await apiClient.get('/vehicles/stats/');
    return response.data;
  },

  // Retire vehicle
  async retire(id: number): Promise<Vehicle> {
    const response = await apiClient.post(`/vehicles/${id}/retire/`);
    return response.data;
  },

  // Activate vehicle
  async activate(id: number): Promise<Vehicle> {
    const response = await apiClient.post(`/vehicles/${id}/activate/`);
    return response.data;
  },
};
