import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiBell, FiSun, FiMoon, FiUser, FiChevronDown, 
  FiSettings, FiLogOut, FiMenu, FiAward, FiBookOpen, 
  FiCheckCircle, FiClock, FiInfo, FiTrash2, FiCheck, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const TopNavbar = ({ onMenuClick }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  });
  const lastNavigatedQuery = useRef(searchQuery);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get('search') || '';
    if (urlQuery !== lastNavigatedQuery.current) {
      setSearchQuery(urlQuery);
      lastNavigatedQuery.current = urlQuery;
    }
  }, [location.search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      triggerSearch(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const triggerSearch = (query) => {
    const params = new URLSearchParams(location.search);
    const currentQuery = params.get('search') || '';
    if (query !== currentQuery) {
      lastNavigatedQuery.current = query;
      if (query.trim()) {
        navigate(`/scholarships?search=${encodeURIComponent(query)}`, { replace: true });
      } else {
        params.delete('search');
        const newSearch = params.toString();
        navigate(`/scholarships${newSearch ? `?${newSearch}` : ''}`, { replace: true });
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch(searchQuery);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    triggerSearch('');
  };

  const [user, setUser] = useState(null);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return;
      }
    } catch (err) {
      console.error('Error fetching user info via API:', err);
    }

    const localUserStr = localStorage.getItem('user');
    if (localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        setUser(localUser);
      } catch (err) {
        console.error('Error parsing local user storage:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    loadUser();

    const handleProfileUpdate = () => {
      loadUser();
    };
    window.addEventListener('storage', handleProfileUpdate);
    window.addEventListener('user-profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleProfileUpdate);
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const cleanName = name.trim();
    if (!cleanName) return 'U';
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
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
        toast.success('Notification marked as read', { id: `read-${id}` });
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
        toast.success('All notifications marked as read', { id: 'read-all' });
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
        toast.success('Notifications cleared', { id: 'clear-all' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsNotificationsOpen(false);

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
        return 'bg-amber-50 dark:bg-amber-955/20 border-amber-100 dark:border-amber-900/50';
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

  // Theme state managed globally by ThemeContext

  return (
    <header className="h-20 bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/40 dark:border-slate-800/40 px-6 lg:px-8 flex items-center justify-between z-20 sticky top-0 backdrop-blur-lg">
      
      {/* Mobile Menu Toggle Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 mr-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
        >
          <FiMenu className="text-xl" />
        </button>
      )}
      
      {/* Left: Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <FiSearch className="text-lg" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Search scholarships, applications, deadlines..."
            className="w-full pl-10 pr-12 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {searchQuery ? (
              <button
                onClick={handleSearchClear}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <FiX className="text-sm" />
              </button>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 bg-white dark:bg-slate-900 pointer-events-none">
                Ctrl K
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Button (visible only on mobile) */}
      <div className="md:hidden">
        <button 
          onClick={() => navigate('/scholarships')}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer"
          title="Search Scholarships"
        >
          <FiSearch className="text-xl" />
        </button>
      </div>

      {/* Right: Actions Block */}
      <div className="flex items-center gap-4 ml-auto">
        
        {/* Dark Mode Toggle */}
        <motion.button
          onClick={toggleDarkMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <FiSun className="text-xl text-amber-500" /> : <FiMoon className="text-xl" />}
        </motion.button>

        {/* Notifications Bell */}
        <div className="relative">
          <motion.button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 relative cursor-pointer"
            title="Notifications"
          >
            <FiBell className="text-xl" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold shadow-sm animate-pulse">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900/95 backdrop-blur-md bg-clip-padding border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-20 flex flex-col overflow-hidden max-h-[480px]"
                >
                  {/* Dropdown Header */}
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h3>
                      <span className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold">
                        {notifications.filter(n => !n.isRead).length} unread alerts
                      </span>
                    </div>

                    {notifications.length > 0 && (
                      <div className="flex items-center gap-2">
                        {notifications.some(n => !n.isRead) && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                            title="Mark all as read"
                          >
                            <FiCheck className="text-sm" />
                            <span className="hidden sm:inline text-[9px]">Mark all read</span>
                          </button>
                        )}
                        <button
                          onClick={handleClearAll}
                          className="p-1.5 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-rose-500 transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
                          title="Clear all"
                        >
                          <FiTrash2 className="text-sm" />
                          <span className="hidden sm:inline text-[9px]">Clear all</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Body - Notifications list */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[340px]">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600">
                          <FiBell className="text-lg" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300">No notifications</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">You are all caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 flex gap-3.5 transition-all cursor-pointer group hover:bg-slate-50/60 dark:hover:bg-slate-800/35 relative ${
                            !notif.isRead ? 'bg-primary-500/[0.02] dark:bg-primary-500/[0.01]' : ''
                          }`}
                        >
                          {/* Type Icon */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${getNotificationIconBg(notif.type)}`}>
                            {getNotificationIcon(notif.type)}
                          </div>

                          {/* Message Content */}
                          <div className="flex-grow min-w-0 pr-4">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className={`text-[11px] font-bold truncate leading-tight ${
                                !notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
                              }`}>
                                {notif.title}
                              </h4>
                              <span className="text-[8px] text-slate-400 dark:text-slate-550 font-bold whitespace-nowrap">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5 leading-normal font-medium pr-1.5 break-words">
                              {notif.message}
                            </p>
                          </div>

                          {/* Read/Unread status dot & Individual action */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            {!notif.isRead ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50 group-hover:hidden" />
                                <button
                                  onClick={(e) => handleMarkAsRead(notif._id, e)}
                                  className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 hover:bg-primary-50 dark:hover:bg-primary-950/20 border border-slate-200/60 dark:border-slate-800 hover:border-primary-500/20 dark:hover:border-primary-500/20 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center text-[10px] font-extrabold shadow-sm transition-all hidden group-hover:flex cursor-pointer"
                                  title="Mark as read"
                                >
                                  <FiCheck />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <Link
                      to="/notifications"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      View All Notifications
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Profile Info */}
        <div className="relative">
          <motion.button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            {/* Initials Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user ? getInitials(user.fullName) : 'U'}
            </div>
            
            {/* User Details */}
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">{user ? user.fullName : ''}</span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium">{user ? (user.course || user.role || 'Student') : ''}</span>
            </div>

            <FiChevronDown className={`text-slate-400 dark:text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {isProfileOpen && (
              <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 bg-clip-padding border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-20 overflow-hidden"
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="block text-xs font-bold text-slate-800 dark:text-white">{user ? user.fullName : ''}</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-400">{user ? user.email : ''}</span>
                  </div>
                  
                  <Link 
                    to="/profile" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <FiUser className="text-slate-400 dark:text-slate-400" />
                    My Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <FiSettings className="text-slate-400 dark:text-slate-400" />
                    Account Settings
                  </Link>
                  
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                  
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      toast.success('Logged out successfully');
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-500 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-900/20 hover:text-rose-600 dark:hover:text-red-300 transition-colors text-left cursor-pointer"
                  >
                    <FiLogOut className="text-slate-400 dark:text-slate-400" />
                    Log Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
};

export default TopNavbar;
