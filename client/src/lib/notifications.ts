import { type Notification } from "@shared/schema";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || "An error occurred");
  }
  return res.json();
}

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const res = await fetch("/api/notifications");
    return handleResponse<Notification[]>(res);
  },
};