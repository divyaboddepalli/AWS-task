import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
}

export interface AuthResponse {
  user: User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    return res.json();
  },

  register: async (data: {
    email: string;
    username: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> => {
    const res = await apiRequest("POST", "/api/auth/register", data);
    return res.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest("POST", "/api/auth/logout");
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await apiRequest("GET", "/api/auth/me");
    return res.json();
  },

  updateUser: async (updates: Partial<User>): Promise<AuthResponse> => {
    const res = await apiRequest("PUT", "/api/auth/me", updates);
    return res.json();
  },
};
