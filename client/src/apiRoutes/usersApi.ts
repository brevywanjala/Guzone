import apiClient from "./axiosConfig";

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  admin_profile?: any;
  customer_profile?: any;
}

export const usersApi = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users/");
    return response.data;
  },

  // Get user by ID
  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Update user (admin only or own profile)
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },
};

