import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Eye,
  Check,
  CheckCheck,
  Trash2,
  Filter
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore, useNotificationStore } from '../lib/store';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  message: string;
  read: boolean;
  created_at: string;
  actor_id: string;
  blog_id?: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  blogs?: {
    title: string;
  };
}

const Notifications: React.FC = () => {
  const { user } = useAuthStore();
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'likes' | 'comments' | 'follows'>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // For now, we'll create mock notifications since we don't have a notifications table
      // In a real app, you'd fetch from a notifications table
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'like',
          message: 'liked your blog post',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          actor_id: 'user1',
          blog_id: 'blog1',
          profiles: {
            username: 'johndoe',
            full_name: 'John Doe',
            avatar_url: null
          },
          blogs: {
            title: 'Getting Started with React'
          }
        },
        {
          id: '2',
          type: 'comment',
          message: 'commented on your blog post',
          read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          actor_id: 'user2',
          blog_id: 'blog1',
          profiles: {
            username: 'janedoe',
            full_name: 'Jane Doe',
            avatar_url: null
          },
          blogs: {
            title: 'Getting Started with React'
          }
        },
        {
          id: '3',
          type: 'follow',
          message: 'started following you',
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          actor_id: 'user3',
          profiles: {
            username: 'bobsmith',
            full_name: 'Bob Smith',
            avatar_url: null
          }
        },
        {
          id: '4',
          type: 'like',
          message: 'liked your blog post',
          read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          actor_id: 'user4',
          blog_id: 'blog2',
          profiles: {
            username: 'alicejohnson',
            full_name: 'Alice Johnson',
            avatar_url: null
          },
          blogs: {
            title: 'Advanced TypeScript Tips'
          }
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-error-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-primary-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-success-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'likes':
        return notification.type === 'like';
      case 'comments':
        return notification.type === 'comment';
      case 'follows':
        return notification.type === 'follow';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMarkAllAsRead}
                className="btn-secondary flex items-center space-x-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all as read</span>
              </motion.button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'likes', label: 'Likes', count: notifications.filter(n => n.type === 'like').length },
              { key: 'comments', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length },
              { key: 'follows', label: 'Follows', count: notifications.filter(n => n.type === 'follow').length },
            ].map(({ key, label, count }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-primary-600 text-white shadow-glow'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    filter === key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Notifications List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 shimmer" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 shimmer" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredNotifications.length > 0 ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`card cursor-pointer transition-all duration-200 hover:shadow-medium ${
                    !notification.read ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      {notification.profiles.avatar_url ? (
                        <img 
                          src={notification.profiles.avatar_url} 
                          alt={notification.profiles.full_name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {notification.profiles.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900">
                            <span className="font-semibold">{notification.profiles.full_name}</span>
                            {' '}
                            <span className="text-gray-600">{notification.message}</span>
                            {notification.blogs && (
                              <>
                                {' '}
                                <span className="font-medium text-gray-900">"{notification.blogs.title}"</span>
                              </>
                            )}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-500">{formatDate(notification.created_at)}</span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-2 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="p-2 rounded-lg text-error-600 hover:bg-error-100 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {filter === 'all' 
                  ? 'When people interact with your blogs, you\'ll see notifications here.'
                  : `You don't have any ${filter} notifications at the moment.`
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;