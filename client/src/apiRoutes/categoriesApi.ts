import apiClient from "./axiosConfig";
import { Category } from "./productsApi";

// Re-export Category for convenience
export type { Category };

export interface CreateCategoryData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>("/products/categories");
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get<Category>(`/products/categories/${id}`);
    return response.data;
  },

  // Create category (admin only)
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post<{ message: string; category: Category } | Category>("/products/categories", data);
    // Backend returns {message, category} or just category - extract the category
    const responseData = response.data;
    if ('category' in responseData && responseData.category) {
      return responseData.category;
    }
    return responseData as Category;
  },

  // Update category (admin only)
  updateCategory: async (id: number, data: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.put<{ message: string; category: Category } | Category>(`/products/categories/${id}`, data);
    // Backend returns {message, category} or just category - extract the category
    const responseData = response.data;
    if ('category' in responseData && responseData.category) {
      return responseData.category;
    }
    return responseData as Category;
  },

  // Delete category (admin only)
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/categories/${id}`);
  },
};

