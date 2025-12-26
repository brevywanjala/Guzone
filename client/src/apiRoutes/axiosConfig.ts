import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // IMPORTANT: Enable sending cookies (for refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return config;
    }
    
    // Don't set Content-Type for FormData, let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    const token = localStorage.getItem("access_token");
    if (token) {
      // Ensure token is a string and not null/undefined
      const cleanToken = token.trim();
      if (cleanToken) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
        // Debug log (remove in production)
        if (process.env.NODE_ENV === 'development') {
          console.log("Adding token to request:", config.url, "Token length:", cleanToken.length);
        }
      } else {
        console.warn("Empty token found in localStorage");
      }
    } else {
      // Only log if it's not an auth endpoint
      if (!config.url?.includes('/auth/')) {
        console.warn("No token found in localStorage for request to:", config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 422 (Invalid JWT token) or 401 (Unauthorized)
    if ((error.response?.status === 401 || error.response?.status === 422) && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh using cookies first (refresh_token cookie is sent automatically with withCredentials: true)
        // If that fails, try with refresh token from localStorage as fallback
        const refreshToken = localStorage.getItem("refresh_token");
        
        const refreshConfig: any = {
          withCredentials: true,  // Send cookies automatically
        };
        
        // Add refresh token to header as fallback if available
        if (refreshToken) {
          refreshConfig.headers = {
            Authorization: `Bearer ${refreshToken}`,
          };
        }
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, refreshConfig);

        const { access_token } = response.data;
        if (access_token) {
          localStorage.setItem("access_token", access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error("No access token in refresh response");
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

