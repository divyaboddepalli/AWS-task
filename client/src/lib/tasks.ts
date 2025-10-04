import { type Task, type InsertTask } from "@shared/schema";

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

export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    const res = await fetch("/api/tasks");
    return handleResponse<Task[]>(res);
  },

  createTask: async (task: Omit<InsertTask, "userId">): Promise<Task> => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    return handleResponse<Task>(res);
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return handleResponse<Task>(res);
  },

  deleteTask: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    return handleResponse<{ message: string }>(res);
  },

  getStats: async (): Promise<{
    total: number;
    high: number;
    completed: number;
    pending: number;
  }> => {
    const res = await fetch("/api/tasks/stats");
    return handleResponse<any>(res);
  },

  getCategoryStats: async (): Promise<Record<string, number>> => {
    const res = await fetch("/api/tasks/categories");
    return handleResponse<Record<string, number>>(res);
  },

  importTaskFromFile: async (file: File): Promise<Task> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/tasks/import-file", {
      method: "POST",
      body: formData,
    });
    return handleResponse<Task>(res);
  },
};