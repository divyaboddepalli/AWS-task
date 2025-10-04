async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || "An error occurred");
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return {} as T;
  }
  return res.json();
}

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
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  register: async (data: {
    email: string;
    username: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  logout: async (): Promise<void> => {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
    });
    await handleResponse<void>(res);
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const res = await fetch("/api/auth/me");
    return handleResponse<AuthResponse>(res);
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(res);
  },

  resetPassword: async (password: string, token: string): Promise<{ message: string }> => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, token }),
    });
    return handleResponse<{ message: string }>(res);
  },
};