import { type User, type InsertUser, type Task, type InsertTask } from "@shared/schema";
import { IStorage } from "./storage";
import crypto from "crypto";

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private tasks: Task[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.find(task => task.id === id);
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return this.tasks.filter(task => task.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const task: Task = {
      ...insertTask,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      completed: false,
    };
    this.tasks.push(task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const taskIndex = this.tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) return undefined;

    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    return this.tasks[taskIndex];
  }

  async deleteTask(id: string): Promise<boolean> {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(task => task.id !== id);
    return this.tasks.length < initialLength;
  }

  async getTaskStats(userId: string): Promise<{
    total: number;
    high: number;
    completed: number;
    pending: number;
  }> {
    const userTasks = await this.getTasksByUserId(userId);

    return {
      total: userTasks.length,
      high: userTasks.filter(task => task.priority === 'high').length,
      completed: userTasks.filter(task => task.completed).length,
      pending: userTasks.filter(task => !task.completed).length,
    };
  }

  async getCategoryStats(userId: string): Promise<Record<string, number>> {
    const userTasks = await this.getTasksByUserId(userId);
    const stats: Record<string, number> = {};

    userTasks.forEach(task => {
      stats[task.category] = (stats[task.category] || 0) + 1;
    });

    return stats;
  }
}