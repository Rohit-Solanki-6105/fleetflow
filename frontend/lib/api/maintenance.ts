// Maintenance API
import apiClient from './client';

export interface MaintenanceRecord {
  id: number;
  maintenance_id: string;
  vehicle: number;
  vehicle_name?: string;
  maintenance_type: 'SCHEDULED' | 'REPAIR' | 'INSPECTION' | 'EMERGENCY';
  description: string;
  cost: number;
  service_date: string;
  odometer_reading?: number;
  service_provider?: string;
  parts_replaced?: string;
  next_service_date?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  attachments?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceStats {
  total_records: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  total_cost: number;
  average_cost: number;
  by_type: Record<string, number>;
}

export const maintenanceApi = {
  // Get all maintenance records
  async getAll(params?: Record<string, any>) {
    const response = await apiClient.get('/maintenance/', { params });
    return response.data;
  },

  // Get maintenance record by ID
  async getById(id: number): Promise<MaintenanceRecord> {
    const response = await apiClient.get(`/maintenance/${id}/`);
    return response.data;
  },

  // Create maintenance record
  async create(data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const response = await apiClient.post('/maintenance/', data);
    return response.data;
  },

  // Update maintenance record
  async update(id: number, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const response = await apiClient.put(`/maintenance/${id}/`, data);
    return response.data;
  },

  // Partial update
  async patch(id: number, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const response = await apiClient.patch(`/maintenance/${id}/`, data);
    return response.data;
  },

  // Delete maintenance record
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/maintenance/${id}/`);
  },

  // Get maintenance history for a vehicle
  async getByVehicle(vehicleId: number) {
    const response = await apiClient.get(`/maintenance/`, {
      params: { vehicle: vehicleId }
    });
    return response.data;
  },

  // Get upcoming scheduled maintenance
  async getUpcoming() {
    const response = await apiClient.get('/maintenance/', {
      params: { status: 'SCHEDULED' }
    });
    return response.data;
  },

  // Get maintenance statistics
  async getStats(): Promise<MaintenanceStats> {
    const response = await apiClient.get('/maintenance/stats/');
    return response.data;
  },
};
