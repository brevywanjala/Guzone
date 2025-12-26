import apiClient from "./axiosConfig";
import { Order } from "./ordersApi";

export interface Customer {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface UpdateCustomerData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export const customersApi = {
  // Get customer profile
  getProfile: async (): Promise<Customer> => {
    const response = await apiClient.get<Customer>("/customers/profile");
    return response.data;
  },

  // Update customer profile
  updateProfile: async (data: UpdateCustomerData): Promise<Customer> => {
    const response = await apiClient.put<Customer>("/customers/profile", data);
    return response.data;
  },

  // Get customer orders
  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>("/customers/orders");
    return response.data;
  },

  // Track order delivery
  trackOrder: async (orderId: number): Promise<{ order: Order; deliveries: any[] }> => {
    const response = await apiClient.get<{ order: Order; deliveries: any[] }>(`/customers/orders/${orderId}/tracking`);
    return response.data;
  },

  // Get all customers (admin only)
  getAllCustomers: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>("/customers/all");
    return response.data;
  },
};

