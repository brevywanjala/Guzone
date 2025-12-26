import apiClient from "./axiosConfig";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: any;
}

export interface Delivery {
  id: number;
  order_id: number;
  tracking_number: string;
  carrier: string | null;
  status: string;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  current_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  delivery_updates: DeliveryUpdate[];
}

export interface DeliveryUpdate {
  id: number;
  delivery_id: number;
  status: string;
  location: string | null;
  description: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  order_number: string;
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_status: string;
  payment_method: string | null;
  payment_confirmation_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  deliveries: Delivery[];
}

export interface CreateOrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  shipping_address: string;
  payment_method?: string;
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: string;
  payment_status?: string;
}

export interface UpdatePaymentStatusData {
  payment_status: string;
  payment_confirmation_message?: string;
}

export const ordersApi = {
  // Create order (customer only)
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post<{ message: string; order: Order } | Order>("/products/orders", data);
    // Backend returns {message, order} or just order - extract the order
    const responseData = response.data;
    if ('order' in responseData && responseData.order) {
      return responseData.order;
    }
    return responseData as Order;
  },

  // Get order by ID
  getOrder: async (id: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/products/orders/${id}`);
    return response.data;
  },

  // Update order status (admin only)
  updateOrderStatus: async (id: number, data: UpdateOrderStatusData): Promise<Order> => {
    const response = await apiClient.put<Order>(`/products/orders/${id}/status`, data);
    return response.data;
  },

  // Update payment status (admin only)
  updatePaymentStatus: async (id: number, data: UpdatePaymentStatusData): Promise<Order> => {
    const response = await apiClient.put<Order>(`/products/orders/${id}/payment`, data);
    return response.data;
  },

  // Get all orders with pagination, filtering, and search (admin only)
  getAllOrders: async (params?: {
    page?: number;
    per_page?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    per_page: number;
    pages: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.date_from) queryParams.append('date_from', params.date_from);
    if (params?.date_to) queryParams.append('date_to', params.date_to);
    
    const response = await apiClient.get<{
      orders: Order[];
      total: number;
      page: number;
      per_page: number;
      pages: number;
    }>(`/products/orders/all?${queryParams.toString()}`);
    return response.data;
  },

  // Complete order - customer confirms payment (updates status to pending)
  completeOrder: async (id: number, shippingAddress?: string): Promise<Order> => {
    const payload = shippingAddress ? { shipping_address: shippingAddress } : {};
    const response = await apiClient.post<Order>(`/products/orders/${id}/complete`, payload);
    return response.data;
  },
};

