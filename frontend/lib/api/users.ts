import apiClient from './client';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'ANALYST';
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number?: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export const usersApi = {
  getAll: async () => {
    const response = await apiClient.get('/users/');
    return response.data.results || response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me/');
    return response.data;
  },

  create: async (data: CreateUserData) => {
    const response = await apiClient.post('/users/', data);
    return response.data;
  },

  update: async (id: number, data: Partial<User>) => {
    const response = await apiClient.patch(`/users/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/users/${id}/`);
  },

  changePassword: async (id: number, data: ChangePasswordData) => {
    const response = await apiClient.post(`/users/${id}/change_password/`, data);
    return response.data;
  },
};
