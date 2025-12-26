import apiClient from "./axiosConfig";
import { Delivery, DeliveryUpdate } from "./ordersApi";

export interface CreateDeliveryData {
  carrier: string;
  status?: string;
  estimated_delivery_date?: string;
  current_location?: string;
  notes?: string;
}

export interface UpdateDeliveryStatusData {
  status: string;
  current_location?: string;
  notes?: string;
  description?: string;
}

export const deliveriesApi = {
  // Create delivery for order (admin only)
  createDelivery: async (orderId: number, data: CreateDeliveryData): Promise<Delivery> => {
    const response = await apiClient.post<Delivery>(`/products/deliveries/order/${orderId}`, data);
    return response.data;
  },

  // Get delivery by ID
  getDelivery: async (id: number): Promise<Delivery> => {
    const response = await apiClient.get<Delivery>(`/products/deliveries/${id}`);
    return response.data;
  },

  // Track delivery by tracking number
  trackDelivery: async (trackingNumber: string): Promise<Delivery> => {
    const response = await apiClient.get<Delivery>(`/products/deliveries/tracking/${trackingNumber}`);
    return response.data;
  },

  // Update delivery status (admin only)
  updateDeliveryStatus: async (id: number, data: UpdateDeliveryStatusData): Promise<Delivery> => {
    const response = await apiClient.post<Delivery>(`/products/deliveries/${id}/update`, data);
    return response.data;
  },

  // Get all deliveries (admin only)
  getAllDeliveries: async (): Promise<Delivery[]> => {
    const response = await apiClient.get<Delivery[]>("/products/deliveries/all");
    return response.data;
  },
};

