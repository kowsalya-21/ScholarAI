import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, FiCheck, FiTrash2, FiAward, FiBookOpen, 
  FiCheckCircle, FiClock, FiUser, FiInfo 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        toast.success('Notification marked as read');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.patch('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.delete('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setNotifications([]);
        toast.success('All notifications cleared');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.patch(`/api/notifications/${notif._id}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        } catch (err) {
          console.error(err);
        }
      }
    }

    let redirectPath = '/dashboard';
    switch (notif.type) {
      case 'Scholarship Recommendation':
        redirectPath = '/recommendations';
        break;
      case 'New Scholarship':
      case 'Deadline Reminder':
        redirectPath = '/scholarships';
        break;
      case 'Application Status':
        redirectPath = '/dashboard';
        break;
      case 'Profile Update':
        redirectPath = '/profile';
        break;
      case 'System Notification':
        redirectPath = '/settings';
        break;
      default:
        redirectPath = '/dashboard';
    }

    navigate(redirectPath);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Scholarship Recommendation':
        return <FiAward className="text-emerald-500 dark:text-emerald-400" />;
      case 'New Scholarship':
        return <FiBookOpen className="text-primary-500 dark:text-primary-400" />;
      case 'Application Status':
        return <FiCheckCircle className="text-indigo-500 dark:text-indigo-400" />;
      case 'Deadline Reminder':
        return <FiClock className="text-amber-500 dark:text-amber-400" />;
      case 'Profile Update':
        return <FiUser className="text-teal-500 dark:text-teal-400" />;
      default:
        return <FiInfo className="text-slate-500 dark:text-slate-400" />;
    }
  };

  const getNotificationIconBg = (type) => {
    switch (type) {
      case 'Scholarship Recommendation':
        return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50';
      case 'New Scholarship':
        return 'bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/50';
      case 'Application Status':
        return 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50';
      case 'Deadline Reminder':
        return 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50';
      case 'Profile Update':
        return 'bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/50';
      default:
        return 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="space-y-8 font-sans max-w-4xl mx-auto pb-12">
      {/* Title & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stay updated with matches and application alerts.</p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.isRead) && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-transparent"
              >
                <FiCheck className="text-sm" />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-transparent"
            >
              <FiTrash2 className="text-sm" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Notifications Card Container */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 rounded-[32px] p-6 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-xs font-semibold">Retrieving notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
              <FiBell className="text-2xl animate-bounce" />
            </div>
            <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-250">No notifications found</h4>
            <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-semibold max-w-sm">
              You are all caught up! New scholarship matches and system alerts will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            <AnimatePresence initial={false}>
              {notifications.map((notif) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`py-4.5 first:pt-0 last:pb-0 flex gap-4 transition-all cursor-pointer group hover:bg-slate-50/[0.3] dark:hover:bg-slate-800/[0.15] relative ${
                    !notif.isRead ? 'bg-primary-500/[0.015] dark:bg-primary-500/[0.008]' : ''
                  }`}
                >
                  {/* Type Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${getNotificationIconBg(notif.type)}`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Message Content */}
                  <div className="flex-grow min-w-0 pr-8">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className={`text-sm font-bold truncate leading-tight ${
                        !notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-350'
                      }`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold whitespace-nowrap">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                  </div>

                  {/* Status Indicator & Mark Read Action */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {!notif.isRead ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50 group-hover:hidden" />
                        <button
                          onClick={(e) => handleMarkAsRead(notif._id, e)}
                          className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 hover:bg-primary-50 dark:hover:bg-primary-950/20 border border-slate-200/60 dark:border-slate-800 hover:border-primary-500/20 dark:hover:border-primary-500/20 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center text-xs shadow-sm transition-all hidden group-hover:flex cursor-pointer"
                          title="Mark as read"
                        >
                          <FiCheck />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-300 dark:text-slate-700 font-medium select-none">Read</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
