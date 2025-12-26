import apiClient from "./axiosConfig";

export interface Offer {
  id: number;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  discounted_price: number | null;
  stock_quantity: number;
  category_id: number | null;
  category: Category | null;
  main_image_url: string | null;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  minimum_order?: number;
  unit_term?: string;
  item_location?: string;
  supplier_name?: string;
  discount_percentage: number | null;
  discount_start_date: string | null;
  discount_end_date: string | null;
  offer_id: number | null;
  offer: Offer | null;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock_quantity?: number;
  category_id?: number;
  main_image_url?: string;
  is_featured?: boolean;
  discount_percentage?: number;
  discount_start_date?: string;
  discount_end_date?: string;
  offer_id?: number;
  sku?: string;
  is_active?: boolean;
  minimum_order?: number;
  unit_term?: string;
  item_location?: string;
  supplier_name?: string;
  images?: Array<{
    image_url: string;
    alt_text?: string;
    display_order?: number;
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface GetProductsParams {
  search?: string;
  page?: number;
  per_page?: number;
  category_id?: number;
}

export const productsApi = {
  // Get all products with optional search and pagination
  getProducts: async (params?: GetProductsParams): Promise<ProductsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    
    const queryString = queryParams.toString();
    const url = `/products/${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get<ProductsResponse>(url);
    return response.data;
  },

  // Get product by ID
  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Create product (admin only)
  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post<Product>("/products/", data);
    return response.data;
  },

  // Update product (admin only)
  updateProduct: async (id: number, data: UpdateProductData): Promise<Product> => {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (admin only)
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  // Add product image (admin only)
  addProductImage: async (productId: number, imageData: { image_url: string; alt_text?: string; display_order?: number }): Promise<ProductImage> => {
    const response = await apiClient.post<ProductImage>(`/products/${productId}/images`, imageData);
    return response.data;
  },

  // Delete product image (admin only)
  deleteProductImage: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/products/${productId}/images/${imageId}`);
  },

  // Upload product image (admin only)
  uploadProductImage: async (file: File): Promise<{ image_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Don't set Content-Type header - axios will set it automatically with boundary
    const response = await apiClient.post<{ message: string; image_url: string }>(
      "/products/upload-image",
      formData
    );
    return response.data;
  },
};

