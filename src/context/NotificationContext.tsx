import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { storage } from '../services/storage';
import { useAuth } from './AuthContext';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: ToastAlert[];
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  requestPushPermissions: () => Promise<boolean>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const refreshNotifications = useCallback(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const list = storage.getNotifications(user.id);
    setNotifications(list);
  }, [user]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastAlert = { id, title, message, type };
    setToasts(prev => [newToast, ...prev].slice(0, 4));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const markAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    if (!user) return;
    storage.markAllNotificationsAsRead(user.id);
    refreshNotifications();
  };

  const requestPushPermissions = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      showToast('Notifications Not Supported', 'Your browser does not support web push notifications.', 'warning');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Push Notifications Enabled', 'You will receive match room credentials and result alerts!', 'success');
        return true;
      } else {
        showToast('Push Notifications Denied', 'Please allow notifications in browser site settings.', 'info');
        return false;
      }
    } catch {
      return false;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        requestPushPermissions,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
