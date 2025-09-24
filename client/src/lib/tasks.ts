import { type Task, type InsertTask } from "@shared/schema";

export const tasksApi = {
  async getTasks(): Promise<Task[]> {
    const res = await fetch("/api/tasks");
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  },

  async createTask(task: Omit<InsertTask, "userId">): Promise<Task> {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error("Failed to create task");
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  },

  async deleteTask(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete task");
    return res.json();
  },

  async getStats(): Promise<{
    total: number;
    high: number;
    completed: number;
    pending: number;
  }> {
    const res = await fetch("/api/tasks/stats");
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },

  async getCategoryStats(): Promise<Record<string, number>> {
    const res = await fetch("/api/tasks/categories");
    if (!res.ok) throw new Error("Failed to fetch category stats");
    return res.json();
  },
};