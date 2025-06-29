import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = localStorage.getItem('furniture_notifications');
    if (storedNotifications) {
      const parsed = JSON.parse(storedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }

    // Set up daily reminders
    setupDailyReminders();
  }, []);

  useEffect(() => {
    // Save notifications to localStorage
    localStorage.setItem('furniture_notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const setupDailyReminders = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM reminder

    const timeUntilReminder = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      addNotification({
        title: 'Daily Data Entry Reminder',
        message: 'Don\'t forget to update your business data today!',
        type: 'reminder',
        priority: 'medium'
      });

      // Set up recurring daily reminders
      setInterval(() => {
        addNotification({
          title: 'Daily Data Entry Reminder',
          message: 'Don\'t forget to update your business data today!',
          type: 'reminder',
          priority: 'medium'
        });
      }, 24 * 60 * 60 * 1000); // Every 24 hours
    }, timeUntilReminder);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Auto-generate business notifications
  const notifyLowStock = (materialName, currentStock, threshold) => {
    addNotification({
      title: 'Low Stock Alert',
      message: `${materialName} is running low (${currentStock} remaining, threshold: ${threshold})`,
      type: 'warning',
      priority: 'high'
    });
  };

  const notifyNewSale = (customerName, amount) => {
    addNotification({
      title: 'New Sale',
      message: `Sale to ${customerName} for ₹${amount.toLocaleString()} completed`,
      type: 'success',
      priority: 'medium'
    });
  };

  const notifyProductionComplete = (productionId) => {
    addNotification({
      title: 'Production Complete',
      message: `Production #${productionId.slice(-6)} has been completed`,
      type: 'info',
      priority: 'medium'
    });
  };

  const notifyPaymentDue = (customerName, amount) => {
    addNotification({
      title: 'Payment Due',
      message: `Payment of ₹${amount.toLocaleString()} is due from ${customerName}`,
      type: 'warning',
      priority: 'high'
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    notifyLowStock,
    notifyNewSale,
    notifyProductionComplete,
    notifyPaymentDue,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};