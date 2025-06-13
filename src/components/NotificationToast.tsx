import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import { useNotificationStore } from '../lib/store';

const NotificationToast: React.FC = () => {
  const { notifications } = useNotificationStore();
  const [visibleNotifications, setVisibleNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Show only the latest unread notification as a toast
    const latestUnread = notifications.find(n => !n.read);
    if (latestUnread && !visibleNotifications.find(v => v.id === latestUnread.id)) {
      setVisibleNotifications([latestUnread]);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisibleNotifications([]);
      }, 5000);
    }
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-error-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-primary-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-success-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleDismiss = (notificationId: string) => {
    setVisibleNotifications(visibleNotifications.filter(n => n.id !== notificationId));
  };

  return (
    <div className="fixed top-20 left-4 z-50 space-y-2">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            className="bg-white rounded-xl shadow-large border border-gray-200 p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.profiles?.avatar_url ? (
                  <img 
                    src={notification.profiles.avatar_url} 
                    alt={notification.profiles.full_name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {notification.profiles?.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{notification.profiles?.full_name}</span>
                  {' '}
                  <span className="text-gray-600">{notification.message}</span>
                  {notification.blogs && (
                    <>
                      {' '}
                      <span className="font-medium text-gray-900">"{notification.blogs.title}"</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Just now</p>
              </div>
              
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;