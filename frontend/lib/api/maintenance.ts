import apiClient from './client';

export interface MaintenanceRecord {
  id: number;
  record_id: string;
  vehicle: number;
  vehicle_details?: {
    id: number;
    vehicle_id: string;
    name: string;
    vehicle_type: string;
    status: string;
    max_capacity_kg: number;
  };
  maintenance_type: string;
  description: string;
  service_provider: string;
  technician_name: string;
  scheduled_date: string;
  completed_date: string | null;
  odometer_reading_km: number;
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  notes: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export const maintenanceApi = {
  getAll: async () => {
    const response = await apiClient.get('/maintenance/');
    return response.data.results || response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/maintenance/${id}/`);
    return response.data;
  },

  create: async (data: Partial<MaintenanceRecord>) => {
    const response = await apiClient.post('/maintenance/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<MaintenanceRecord>) => {
    const response = await apiClient.patch(`/maintenance/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/maintenance/${id}/`);
  },

  complete: async (id: number, data: { completion_date: string; labor_cost: number; parts_cost: number; notes?: string }) => {
    const response = await apiClient.post(`/maintenance/${id}/complete/`, data);
    return response.data;
  },
};
