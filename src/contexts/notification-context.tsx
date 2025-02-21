'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Notification, NotificationContainer, NotificationType } from '@/components/notification'

interface NotificationContextType {
  addNotification: (type: NotificationType, title: string, message: string, duration?: number) => void
  setPendingNotification: (type: NotificationType, title: string, message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: NotificationType
    title: string
    message: string
    duration?: number
  }>>([])

  useEffect(() => {
    const storedNotification = localStorage.getItem('pendingNotification')
    if (storedNotification) {
      const { type, title, message, duration } = JSON.parse(storedNotification)
      addNotification(type, title, message, duration)
      localStorage.removeItem('pendingNotification')
    }
  }, [])

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications((prev) => [...prev, { id, type, title, message, duration }])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  const setPendingNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    duration?: number
  ) => {
    localStorage.setItem('pendingNotification', JSON.stringify({ type, title, message, duration }))
  }, [])

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
  )
}