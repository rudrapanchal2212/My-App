import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import {
  initNotifications,
  triggerPhoneNotification,
  isNativePlatform,
} from '../services/notificationService';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const seenIdsRef = useRef(new Set());
  const initialLoadDoneRef = useRef(false);

  // Initialize phone notification permissions on mount
  useEffect(() => {
    initNotifications();
  }, []);

  // Reset seen IDs when user logs out or changes
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      seenIdsRef.current.clear();
      initialLoadDoneRef.current = false;
    }
  }, [isAuthenticated, user?._id]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);

        // If this is the very first fetch for this session, populate the seen list
        if (!initialLoadDoneRef.current) {
          data.notifications.forEach((n) => seenIdsRef.current.add(n._id));
          initialLoadDoneRef.current = true;
          return;
        }

        // Check for any newly arrived notifications
        data.notifications.forEach((n) => {
          if (!seenIdsRef.current.has(n._id)) {
            seenIdsRef.current.add(n._id);
            // Trigger native phone notification!
            triggerPhoneNotification({
              title: n.title,
              message: n.message,
              id: n._id,
            });
          }
        });
      }
    } catch (err) {
      // Silently catch background poll errors
    }
  };

  // Poll for live notifications every 5 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Quick manual trigger to test phone notifications
  const sendTestNotification = async () => {
    await triggerPhoneNotification({
      title: 'QuickBite Order Alert! 🍕',
      message: 'This is a test notification on your phone. Order notifications will appear here!',
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        setIsOpen,
        fetchNotifications,
        markAllAsRead,
        sendTestNotification,
        isNative: isNativePlatform(),
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
