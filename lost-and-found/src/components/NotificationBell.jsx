import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoNotificationsOutline, IoCheckmarkDoneOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/api';

// Notification type → human readable message + icon
const getNotificationContent = (notification) => {
  switch (notification.type) {
    case 'location_clarification_request':
      return {
        icon: '📍',
        message: `Someone needs location clarification on your found "${notification.itemTitle}"`,
        color: 'text-orange-600'
      };
    case 'location_clarification_resolved':
      return {
        icon: '✅',
        message: `Location updated for found "${notification.itemTitle}" — check the post`,
        color: 'text-green-600'
      };
    case 'potential_match_found':
      return {
        icon: '🎉',
        message: `Someone found an item matching your lost "${notification.itemTitle}"!`,
        color: 'text-green-600'
      };
    case 'new_item':
      return {
        icon: '🔔',
        message: `New item reported: "${notification.itemTitle}"`,
        color: 'text-blue-600'
      };
    default:
      return {
        icon: '🔔',
        message: notification.message || 'New notification',
        color: 'text-gray-600'
      };
  }
};

const timeAgo = (isoString) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

function NotificationBell() {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications on mount + every 30 seconds
  useEffect(() => {
    if (!currentUser) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await getNotifications(currentUser.uid);
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    setOpen(!open);
    // Mark all as read when opening
    if (!open && unreadCount > 0 && currentUser) {
      try {
        await markAllNotificationsRead(currentUser.uid);
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark all read:', err);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark individual as read
    if (!notification.read) {
      await markNotificationRead(notification.id);
    }
    setOpen(false);
    // Navigate to the item if itemId exists
    if (notification.itemId) {
      navigate(`/?item=${notification.itemId}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative text-2xl text-gray-600 hover:text-orange-500 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <IoNotificationsOutline />
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <IoCheckmarkDoneOutline />
                All caught up
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  You'll be notified about new items and location updates
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const { icon, message, color } = getNotificationContent(notification);
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                      !notification.read ? 'bg-orange-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${color} leading-snug`}>
                          {message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {/* Unread dot */}
                      {!notification.read && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

        </div>
      )}
    </div>
  );
}

export default NotificationBell;