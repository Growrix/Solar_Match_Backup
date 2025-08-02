import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_link: string;
  status: 'unread' | 'read';
  created_at: string;
}

interface NotificationBubbleProps {
  onViewAll: () => void;
}

const NotificationBubble: React.FC<NotificationBubbleProps> = ({ onViewAll }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNewNotifications();
    }
    
    // Add click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // In a real app, this would fetch from a notifications table
      // For demo purposes, we'll create mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'verification',
          title: 'Verify Your Email',
          message: 'Verify your email to continue requesting quotes.',
          action_link: 'verification_settings',
          status: 'unread',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: '2',
          type: 'quote',
          title: 'New Quote from SunPro',
          message: 'Quote for 6.6kW system with battery backup',
          action_link: 'quote_123',
          status: 'unread',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          id: '3',
          type: 'chat',
          title: 'Installer Messaged You',
          message: 'GreenSpark has sent a counteroffer message.',
          action_link: 'chat_456',
          status: 'read',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => n.status === 'unread').length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const subscribeToNewNotifications = () => {
    // In a real app, this would subscribe to real-time notifications
    // For demo purposes, we'll just log a message
    console.log('Subscribed to new notifications');
    
    // Return a cleanup function
    return () => {
      console.log('Unsubscribed from notifications');
    };
  };

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      // In a real app, this would update the notification status in the database
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' } 
          : notification
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      // In a real app, this would update all notifications in the database
      setNotifications(notifications.map(notification => ({ ...notification, status: 'read' })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleAction = (actionLink: string) => {
    // In a real app, this would navigate to the relevant page or component
    console.log('Action link clicked:', actionLink);
    
    // Parse the action link to determine where to navigate
    const [action, id] = actionLink.split('_');
    
    // Dispatch navigation event based on action type
    switch (action) {
      case 'quote':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'written-quotes' }));
        break;
      case 'chat':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'chat' }));
        break;
      case 'bid':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'bidding-room' }));
        break;
      case 'rate':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'call-visit-leads' }));
        break;
      case 'verification':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'settings' }));
        break;
      default:
        console.log('Unknown action type:', action);
    }
    
    // Close dropdown
    setShowDropdown(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    }
    
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    
    if (diffMins > 0) {
      return `${diffMins}m ago`;
    }
    
    return 'Just now';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-white hover:bg-onyx-500/50 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-giants_orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unreadCount}
          </div>
        )}
      </button>
      
      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gradient-to-br from-night-500 to-black-500 rounded-xl border border-onyx-600/30 shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-onyx-600/30 flex items-center justify-between">
            <h3 className="text-white font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={(e) => handleMarkAllAsRead(e)}
                  className="text-battleship_gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-onyx-500/30"
                  title="Mark all as read"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onViewAll}
                className="text-giants_orange-500 hover:text-giants_orange-400 transition-colors text-sm"
              >
                View All
              </button>
            </div>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-battleship_gray-700">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-onyx-600/30">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    onClick={() => handleAction(notification.action_link)}
                    className={`p-4 hover:bg-onyx-600/30 cursor-pointer transition-colors ${
                      notification.status === 'unread' ? 'bg-onyx-600/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.status === 'unread' ? 'bg-giants_orange-500' : 'bg-battleship_gray-600'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <h4 className="text-white text-sm font-medium">{notification.title}</h4>
                          <span className="text-battleship_gray-600 text-xs">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-battleship_gray-700 text-xs mb-2">{notification.message}</p>
                      </div>
                      
                      {notification.status === 'unread' && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="text-battleship_gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-onyx-500/30"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-onyx-600/30 text-center">
            <button
              onClick={onViewAll}
              className="text-giants_orange-500 hover:text-giants_orange-400 transition-colors text-sm font-medium"
            >
              See All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBubble;