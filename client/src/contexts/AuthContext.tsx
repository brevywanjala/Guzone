import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi } from "@/apiRoutes";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  googleAuth: (token: string) => Promise<{ user: User; isNewUser: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Track if we're still loading auth state from localStorage
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading = true

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid data
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }
    }
    // Mark loading as complete after checking localStorage
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login({
        email,
        password,
      });

      // Ensure tokens exist before storing
      if (!data.access_token) {
        throw new Error("Access token not received from server");
      }

      // Store tokens immediately and synchronously
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      
      // Verify token was stored
      const storedToken = localStorage.getItem("access_token");
      if (!storedToken || storedToken !== data.access_token) {
        console.error("Token storage failed! Expected:", data.access_token?.substring(0, 20), "Got:", storedToken?.substring(0, 20));
      } else {
        console.log("Token stored successfully, length:", storedToken.length);
      }
      
      // Return user data
      return data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || "Login failed");
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      // Backend will generate username from email prefix automatically
      const data = await authApi.register({
        email,
        password,
        role: "customer",
      });

      // Ensure tokens exist before storing
      if (!data.access_token) {
        throw new Error("Access token not received from server");
      }

      // Store tokens immediately and synchronously
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      
      // Verify token was stored
      const storedToken = localStorage.getItem("access_token");
      if (!storedToken || storedToken !== data.access_token) {
        console.error("Token storage failed! Expected:", data.access_token?.substring(0, 20), "Got:", storedToken?.substring(0, 20));
      } else {
        console.log("Token stored successfully, length:", storedToken.length);
      }
      
      // Return user data
      return data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || "Signup failed");
    }
  };

  const googleAuth = async (token: string) => {
    try {
      const data = await authApi.googleAuth(token);

      // Ensure tokens exist before storing
      if (!data.access_token) {
        throw new Error("Access token not received from server");
      }

      // Store tokens immediately and synchronously
      localStorage.setItem("access_token", data.access_token);
      setToken(data.access_token);
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
      }
      
      // Return user data and whether it's a new user
      return {
        user: data.user,
        isNewUser: data.is_new_user || false,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || "Google authentication failed");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        googleAuth,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

