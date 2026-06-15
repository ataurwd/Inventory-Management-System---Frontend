import { create } from 'zustand';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  type: 'low-stock' | 'expiry' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationsStore {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notif) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: Math.random().toString(),
      timestamp: new Date(),
      read: false,
    };

    if (newNotif.type === 'low-stock') {
      toast.warning(newNotif.title, {
        description: newNotif.message,
        duration: 6000,
      });
    } else if (newNotif.type === 'expiry') {
      toast.error(newNotif.title, {
        description: newNotif.message,
        duration: 8000,
      });
    } else {
      toast.info(newNotif.title, {
        description: newNotif.message,
      });
    }

    set((state) => ({
      notifications: [newNotif, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
}));
