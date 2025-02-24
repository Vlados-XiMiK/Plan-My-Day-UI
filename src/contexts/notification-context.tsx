'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Notification, NotificationContainer, NotificationType } from '@/components/notification';

// Interface for notification data
interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

// Interface for context type
interface NotificationContextType {
  addNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
  setPendingNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Props for the provider
interface NotificationProviderProps {
  children: React.ReactNode;
}

// Maximum number of notifications allowed
const MAX_NOTIFICATIONS = 5;

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Load pending notification from localStorage on mount
  useEffect(() => {
    try {
      const storedNotification = localStorage.getItem('pendingNotification');
      if (storedNotification) {
        const { type, title, message, duration } = JSON.parse(storedNotification) as Omit<NotificationData, 'id'>;
        addNotification(type, title, message, duration);
        localStorage.removeItem('pendingNotification');
      }
    } catch (error) {
      console.error('Error loading pendingNotification:', error);
      addNotification('error', 'Error', 'Failed to load notification', 5000);
    }
  }, []);

  // Add a new notification with a limit
  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string, duration?: number) => {
      const id = nanoid(); // Generate unique ID using nanoid
      setNotifications((prev) => {
        if (prev.length >= MAX_NOTIFICATIONS) {
          return [...prev.slice(1), { id, type, title, message, duration }];
        }
        return [...prev, { id, type, title, message, duration }];
      });
    },
    []
  );

  // Remove a notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Save a notification to localStorage as pending
  const setPendingNotification = useCallback(
    (type: NotificationType, title: string, message: string, duration?: number) => {
      try {
        localStorage.setItem('pendingNotification', JSON.stringify({ type, title, message, duration }));
      } catch (error) {
        console.error('Error saving pendingNotification:', error);
        addNotification('error', 'Error', 'Failed to save notification', 5000);
      }
    },
    [addNotification]
  );

  return (
    <NotificationContext.Provider value={{ addNotification, setPendingNotification }}>
      {children}
      <NotificationContainer>
        {notifications.map((notification, index) => (
          <Notification
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            duration={notification.duration}
            onClose={removeNotification}
            index={index}
          />
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};