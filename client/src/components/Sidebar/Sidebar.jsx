import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiOutlineHome, 
  HiOutlineAcademicCap, 
  HiOutlineBookmark, 
  HiOutlineClipboardList, 
  HiOutlineBell, 
  HiOutlineUser, 
  HiOutlineChatAlt2, 
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
  HiX
} from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';

const Sidebar = ({ onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve user role to display dynamic links
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.role === 'Admin';

  const menuItems = isAdmin 
    ? [
        { name: 'Dashboard', path: '/admin', icon: HiOutlineHome },
        { name: 'Scholarships', path: '/admin?tab=scholarships', icon: HiOutlineAcademicCap },
        { name: 'Students', path: '/admin?tab=students', icon: HiOutlineUser },
        { name: 'Analytics', path: '/admin?tab=analytics', icon: HiOutlineTrendingUp },
        { name: 'Settings', path: '/admin?tab=settings', icon: HiOutlineCog },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: HiOutlineHome },
        { name: 'Scholarships', path: '/scholarships', icon: HiOutlineAcademicCap },
        { name: 'AI Recommendations', path: '/recommendations', icon: HiOutlineSparkles },
        { name: 'Saved Scholarships', path: '/saved', icon: HiOutlineBookmark },
        { name: 'Applications', path: '/applications', icon: HiOutlineClipboardList },
        { name: 'Notifications', path: '/notifications', icon: HiOutlineBell },
        { name: 'AI Assistant', path: '/chatbot', icon: HiOutlineChatAlt2 },
        { name: 'Profile', path: '/profile', icon: HiOutlineUser },
        { name: 'Settings', path: '/settings', icon: HiOutlineCog },
      ];

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path && !location.search;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };


  return (
    <aside className="w-64 h-screen bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl text-slate-600 dark:text-slate-400 flex flex-col border-r border-slate-200/50 dark:border-slate-800/60 fixed left-0 top-0 z-40">
      {/* Header / Brand */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <FaGraduationCap className="text-lg" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Scholar<span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>
        
        {/* Mobile close button */}
        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-slate-800 dark:hover:text-slate-250 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onCloseMobile}
              className="block"
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 relative ${
                  active
                    ? 'bg-gradient-to-r from-primary-600/10 to-secondary-600/10 dark:from-primary-500/20 dark:to-secondary-500/20 text-primary-700 dark:text-primary-400 font-extrabold border-l-4 border-primary-600 dark:border-primary-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-l-4 border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-550 group-hover:text-slate-600 dark:group-hover:text-slate-350'}`} />
                <span>{item.name}</span>
                {active && (
                  <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 dark:hover:text-rose-455 transition-all duration-200 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
        >
          <HiOutlineLogout className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
