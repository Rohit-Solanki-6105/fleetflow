// Trip API
import apiClient from './client';

export interface Trip {
  id: number;
  trip_id: string;
  vehicle: number;
  vehicle_details?: any;
  driver: number;
  driver_details?: any;
  pickup_location: string;
  pickup_address: string;
  pickup_coordinates?: string;
  dropoff_location: string;
  dropoff_address: string;
  dropoff_coordinates?: string;
  cargo_description: string;
  cargo_weight_kg: number;
  cargo_value?: number;
  scheduled_pickup_time: string;
  scheduled_delivery_time: string;
  actual_pickup_time?: string;
  actual_delivery_time?: string;
  estimated_distance_km?: number;
  actual_distance_km?: number;
  calculated_distance_km?: number;
  start_odometer_km?: number;
  end_odometer_km?: number;
  status: 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  duration_hours?: number;
  is_delayed: boolean;
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export const tripApi = {
  // Get all trips
  async getAll(params?: Record<string, any>) {
    const response = await apiClient.get('/trips/', { params });
    return response.data;
  },

  // Get trip by ID
  async getById(id: number): Promise<Trip> {
    const response = await apiClient.get(`/trips/${id}/`);
    return response.data;
  },

  // Create trip
  async create(data: Partial<Trip>): Promise<Trip> {
    const response = await apiClient.post('/trips/', data);
    return response.data;
  },

  // Update trip
  async update(id: number, data: Partial<Trip>): Promise<Trip> {
    const response = await apiClient.patch(`/trips/${id}/`, data);
    return response.data;
  },

  // Delete trip
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/trips/${id}/`);
  },

  // Dispatch trip
  async dispatch(id: number, start_odometer_km: number): Promise<Trip> {
    const response = await apiClient.post(`/trips/${id}/dispatch/`, {
      start_odometer_km,
    });
    return response.data;
  },

  // Complete trip
  async complete(
    id: number,
    data: { end_odometer_km: number; actual_distance_km?: number; notes?: string }
  ): Promise<Trip> {
    const response = await apiClient.post(`/trips/${id}/complete/`, data);
    return response.data;
  },

  // Cancel trip
  async cancel(id: number, cancellation_reason: string): Promise<Trip> {
    const response = await apiClient.post(`/trips/${id}/cancel/`, {
      cancellation_reason,
    });
    return response.data;
  },

  // Get trip stats
  async getStats() {
    const response = await apiClient.get('/trips/stats/');
    return response.data;
  },

  // Get active trips
  async getActive() {
    const response = await apiClient.get('/trips/active/');
    return response.data;
  },
};
