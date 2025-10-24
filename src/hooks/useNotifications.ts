import { useState, useCallback } from 'react';
import type { NotificationProps } from '@/components/ui/Notification';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const addNotification = useCallback((
    notification: Omit<NotificationProps, 'id' | 'onClose'>
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationProps = {
      ...notification,
      id,
      onClose: removeNotification,
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'error', title, message });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  const info = useCallback((title: string, message?: string) => {
    return addNotification({ type: 'info', title, message });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
};