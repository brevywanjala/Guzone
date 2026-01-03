import apiClient from "./axiosConfig";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  access_token: string;
  refresh_token: string;
}

export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Use a separate axios instance for login to avoid adding Authorization header
    const axios = (await import("axios")).default;
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials, {
      withCredentials: true,  // IMPORTANT: Send cookies
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // Register new user
  register: async (data: SignupData): Promise<AuthResponse> => {
    // Use a separate axios instance for register to avoid adding Authorization header
    const axios = (await import("axios")).default;
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, data, {
      withCredentials: true,  // IMPORTANT: Send cookies
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // Refresh access token
  refreshToken: async (): Promise<{ access_token: string }> => {
    const response = await apiClient.post<{ access_token: string }>("/auth/refresh");
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthResponse["user"]> => {
    const response = await apiClient.get<AuthResponse["user"]>("/auth/me");
    return response.data;
  },

  // Google OAuth login/signup
  googleAuth: async (token: string): Promise<AuthResponse & { is_new_user?: boolean }> => {
    const axios = (await import("axios")).default;
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const response = await axios.post<AuthResponse & { is_new_user?: boolean }>(
      `${API_BASE_URL}/auth/google`,
      { token },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Check if profile is complete
  checkProfileComplete: async (): Promise<{
    is_complete: boolean;
    missing_fields: string[];
    customer: any;
  }> => {
    const response = await apiClient.get<{
      is_complete: boolean;
      missing_fields: string[];
      customer: any;
    }>("/auth/check-profile-complete");
    return response.data;
  },
};

