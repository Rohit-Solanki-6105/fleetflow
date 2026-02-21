// Expenses API
import apiClient from './client';

export interface FuelExpense {
  id: number;
  expense_id: string;
  vehicle: number;
  vehicle_name?: string;
  driver?: number;
  driver_name?: string;
  fuel_type: 'DIESEL' | 'PETROL' | 'CNG' | 'ELECTRIC';
  quantity_liters?: number;
  cost_per_liter: number;
  total_cost: number;
  odometer_reading: number;
  date: string;
  location?: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OtherExpense {
  id: number;
  expense_id: string;
  vehicle: number;
  vehicle_name?: string;
  expense_type: 'TOLL' | 'PARKING' | 'PERMIT' | 'INSURANCE' | 'TAX' | 'OTHER';
  description: string;
  amount: number;
  date: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseStats {
  total_fuel_cost: number;
  total_other_cost: number;
  total_cost: number;
  by_vehicle: Record<string, number>;
  by_type: Record<string, number>;
  by_month: Record<string, number>;
}

export const fuelExpenseApi = {
  // Get all fuel expenses
  async getAll(params?: Record<string, any>) {
    const response = await apiClient.get('/fuel-expenses/', { params });
    return response.data;
  },

  // Get fuel expense by ID
  async getById(id: number): Promise<FuelExpense> {
    const response = await apiClient.get(`/fuel-expenses/${id}/`);
    return response.data;
  },

  // Create fuel expense
  async create(data: Partial<FuelExpense>): Promise<FuelExpense> {
    const response = await apiClient.post('/fuel-expenses/', data);
    return response.data;
  },

  // Update fuel expense
  async update(id: number, data: Partial<FuelExpense>): Promise<FuelExpense> {
    const response = await apiClient.put(`/fuel-expenses/${id}/`, data);
    return response.data;
  },

  // Delete fuel expense
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/fuel-expenses/${id}/`);
  },

  // Get expenses by vehicle
  async getByVehicle(vehicleId: number) {
    const response = await apiClient.get('/fuel-expenses/', {
      params: { vehicle: vehicleId }
    });
    return response.data;
  },
};

export const otherExpenseApi = {
  // Get all other expenses
  async getAll(params?: Record<string, any>) {
    const response = await apiClient.get('/other-expenses/', { params });
    return response.data;
  },

  // Get other expense by ID
  async getById(id: number): Promise<OtherExpense> {
    const response = await apiClient.get(`/other-expenses/${id}/`);
    return response.data;
  },

  // Create other expense
  async create(data: Partial<OtherExpense>): Promise<OtherExpense> {
    const response = await apiClient.post('/other-expenses/', data);
    return response.data;
  },

  // Update other expense
  async update(id: number, data: Partial<OtherExpense>): Promise<OtherExpense> {
    const response = await apiClient.put(`/other-expenses/${id}/`, data);
    return response.data;
  },

  // Delete other expense
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/other-expenses/${id}/`);
  },

  // Get expenses by vehicle
  async getByVehicle(vehicleId: number) {
    const response = await apiClient.get('/other-expenses/', {
      params: { vehicle: vehicleId }
    });
    return response.data;
  },
};

export const expenseApi = {
  // Get combined expense statistics
  async getStats(): Promise<ExpenseStats> {
    const response = await apiClient.get('/analytics/expenses/');
    return response.data;
  },
};
