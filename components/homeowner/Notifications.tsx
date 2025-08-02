import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Phone, 
  CheckCircle, 
  AlertTriangle, 
  FileText,
  Filter,
  Search,
  Trash2,
  RefreshCw,
  ArrowRight,
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  user_id: string;
  type: 'verification' | 'quote' | 'chat' | 'bid' | 'followup';
  title: string;
  message: string;
  action_link: string;
  status: 'unread' | 'read';
  created_at: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNewNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would fetch from a notifications table
      // For demo purposes, we'll create mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: user?.id || '',
          type: 'verification',
          title: 'Verify Your Email',
          message: 'Verify your email to continue requesting quotes.',
          action_link: 'verification_settings',
          status: 'unread',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: '2',
          user_id: user?.id || '',
          type: 'quote',
          title: 'New Quote from SunPro',
          message: 'Quote for 6.6kW system with battery backup',
          action_link: 'quote_123',
          status: 'unread',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          id: '3',
          user_id: user?.id || '',
          type: 'chat',
          title: 'Installer Messaged You',
          message: 'GreenSpark has sent a counteroffer message.',
          action_link: 'chat_456',
          status: 'read',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
        },
        {
          id: '4',
          user_id: user?.id || '',
          type: 'bid',
          title: 'Bid Ending in 12 Hours',
          message: 'Your bidding window for BrightVolt is about to close.',
          action_link: 'bid_789',
          status: 'read',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
          id: '5',
          user_id: user?.id || '',
          type: 'followup',
          title: 'How Was the Call?',
          message: 'Did you speak to SolarOne? Rate your experience.',
          action_link: 'rate_321',
          status: 'read',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
        },
        {
          id: '6',
          user_id: user?.id || '',
          type: 'quote',
          title: 'New Quote from EcoSolar',
          message: 'Quote for 10kW premium system',
          action_link: 'quote_654',
          status: 'read',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
        },
        {
          id: '7',
          user_id: user?.id || '',
          type: 'chat',
          title: 'New Messages (3)',
          message: 'You have unread messages from multiple installers',
          action_link: 'chats',
          status: 'unread',
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setRefreshing(false), 1000); // Simulate network delay
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // In a real app, this would update the notification status in the database
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' } 
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to update notification. Please try again.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In a real app, this would update all notifications in the database
      setNotifications(notifications.map(notification => ({ ...notification, status: 'read' })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to update notifications. Please try again.');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // In a real app, this would delete the notification from the database
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification. Please try again.');
    }
  };

  const handleClearAll = async () => {
    try {
      // In a real app, this would delete all notifications from the database
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setError('Failed to clear notifications. Please try again.');
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
      case 'chats':
        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'chat' }));
        break;
      default:
        console.log('Unknown action type:', action);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'verification':
        return <Mail className="h-5 w-5 text-blue-400" />;
      case 'quote':
        return <FileText className="h-5 w-5 text-green-400" />;
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-purple-400" />;
      case 'bid':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'followup':
        return <Phone className="h-5 w-5 text-giants_orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-battleship_gray-600" />;
    }
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
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    if (diffMins > 0) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    return 'Just now';
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {
      'Today': [],
      'Yesterday': [],
      'Last 7 Days': [],
      'Older': []
    };
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      
      if (date.toDateString() === now.toDateString()) {
        groups['Today'].push(notification);
      } else if (date.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(notification);
      } else if (date > lastWeek) {
        groups['Last 7 Days'].push(notification);
      } else {
        groups['Older'].push(notification);
      }
    });
    
    return groups;
  };

  // Filter and search notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filterType === 'all' || notification.type === filterType;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-2">Notifications & Reminders</h2>
            <p className="text-battleship_gray-700">Stay updated on your solar journey</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="bg-onyx-600/50 text-battleship_gray-700 hover:text-white hover:bg-onyx-600/70 px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark All as Read</span>
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-onyx-600/50 text-battleship_gray-700 hover:text-white hover:bg-onyx-600/70 px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-2 text-white focus:border-giants_orange-500 focus:outline-none transition-colors appearance-none"
            >
              <option value="all">All Notifications</option>
              <option value="verification">Verification</option>
              <option value="quote">Quotes</option>
              <option value="chat">Messages</option>
              <option value="bid">Bidding</option>
              <option value="followup">Follow-ups</option>
            </select>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-2 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotifications.length === 0 && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
          <Bell className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
          <p className="text-battleship_gray-700 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'No notifications match your current filters' 
              : 'You have no notifications at this time'}
          </p>
          {(searchTerm || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Notifications List */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="space-y-8">
          {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
            groupNotifications.length > 0 && (
              <div key={dateGroup}>
                <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-battleship_gray-600" />
                  <span>{dateGroup}</span>
                </h3>
                
                <div className="space-y-4">
                  {groupNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`bg-onyx-500/30 backdrop-blur-sm rounded-2xl border ${
                        notification.status === 'unread' 
                          ? 'border-giants_orange-500/30' 
                          : 'border-onyx-600/30'
                      } p-6 hover:border-giants_orange-500/50 transition-all`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Notification Type Icon */}
                        <div className={`p-3 rounded-xl ${
                          notification.type === 'verification' ? 'bg-blue-500/20' :
                          notification.type === 'quote' ? 'bg-green-500/20' :
                          notification.type === 'chat' ? 'bg-purple-500/20' :
                          notification.type === 'bid' ? 'bg-yellow-500/20' :
                          'bg-giants_orange-500/20'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Notification Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold">{notification.title}</h4>
                            <span className="text-xs text-battleship_gray-600">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-battleship_gray-700 mb-4">{notification.message}</p>
                          
                          {/* Action Button */}
                          <button
                            onClick={() => handleAction(notification.action_link)}
                            className="bg-onyx-600/50 text-white hover:bg-onyx-600/70 px-4 py-2 rounded-lg text-sm font-semibold transition-all inline-flex items-center space-x-2"
                          >
                            <span>View Details</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2">
                          {notification.status === 'unread' && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-2 text-battleship_gray-600 hover:text-white hover:bg-onyx-600/50 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-2 text-battleship_gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;