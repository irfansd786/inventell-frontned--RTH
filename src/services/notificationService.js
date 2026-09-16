import { initialNotificationsList } from '../data/notificationsData';

let notifications = [...initialNotificationsList];

export const notificationService = {
  getNotifications: async () => notifications,
  markAsRead: async (id) => {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return notifications;
  },
  markAllAsRead: async () => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return notifications;
  }
};
