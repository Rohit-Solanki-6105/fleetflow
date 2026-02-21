import apiClient from './client';

export interface Expense {
  id: number;
  expense_id: string;
  vehicle: number;
  vehicle_details?: {
    id: number;
    vehicle_id: string;
    name: string;
    make: string;
    model: string;
  };
  date: string;
  amount: number;
  expense_type: string;
  description: string;
  vendor?: string;
  receipt_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const expensesApi = {
  getAll: async () => {
    const response = await apiClient.get('/other-expenses/');
    return response.data.results || response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/other-expenses/${id}/`);
    return response.data;
  },

  create: async (data: Partial<Expense>) => {
    const response = await apiClient.post('/other-expenses/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Expense>) => {
    const response = await apiClient.patch(`/other-expenses/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/other-expenses/${id}/`);
  },
};
