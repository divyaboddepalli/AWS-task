import { type User, type InsertUser, type Task, type InsertTask } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTask(id: string): Promise<Task | undefined>;
  getTasksByUserId(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getTaskStats(userId: string): Promise<{
    total: number;
    high: number;
    completed: number;
    pending: number;
  }>;
  getCategoryStats(userId: string): Promise<Record<string, number>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter((task) => task.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { 
      ...insertTask, 
      id, 
      completed: insertTask.completed ?? false,
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
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

export const storage = new MemStorage();
