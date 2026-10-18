import React from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

export const isNativePlatform = () => Capacitor.isNativePlatform();

/**
 * Initialize native push/local notifications and channels on Android device
 */
export const initNotifications = async () => {
  if (isNativePlatform()) {
    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        // Create high-priority notification channel for Android 8+
        await LocalNotifications.createChannel({
          id: 'quickbite_orders',
          name: 'QuickBite Orders & Deliveries',
          description: 'Instant alerts for order approvals, food preparation and delivery progress',
          importance: 5, // High importance (heads-up banner + sound)
          visibility: 1, // Visible on lock screen
          vibration: true,
          lights: true,
          lightColor: '#f97316',
        });
        console.log('✅ Android notification channel created successfully');
      }
    } catch (err) {
      console.warn('Could not initialize Android local notifications:', err);
    }
  } else if ('Notification' in window && Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (err) {
      console.warn('Web notification permission prompt error:', err);
    }
  }
};

/**
 * Triggers a real native system notification on the mobile phone
 */
export const triggerPhoneNotification = async ({ title, message, id }) => {
  const notificationId = typeof id === 'number' ? id : Math.floor(Math.random() * 100000) + 1;

  // 1. If running as an Android APK on phone:
  if (isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title || 'QuickBite Alert',
            body: message || 'You have an order update',
            id: notificationId,
            channelId: 'quickbite_orders',
            schedule: { at: new Date(Date.now() + 100) },
            extra: { id },
          },
        ],
      });
    } catch (err) {
      console.warn('Native LocalNotifications schedule error:', err);
    }
  } else if ('Notification' in window && Notification.permission === 'granted') {
    // 2. If running in browser with web notification support:
    try {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
      });
    } catch (err) {
      console.warn('Web notification error:', err);
    }
  }

  // 3. Always show in-app interactive toast
  toast(
    (t) => (
      <div className="flex flex-col space-y-1">
        <span className="font-bold text-xs text-brand-600">{title}</span>
        <span className="text-[11px] text-slate-700">{message}</span>
      </div>
    ),
    {
      icon: '🔔',
      duration: 5000,
      style: {
        borderRadius: '16px',
        border: '1px solid #fed7aa',
        background: '#fff',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    }
  );
};
