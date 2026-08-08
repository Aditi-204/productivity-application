import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { to: '/attendance', label: 'Attendance', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { to: '/reports', label: 'Reports', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },

];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      className="hidden lg:flex lg:flex-col w-72 bg-[#f5f0ff]/90 dark:bg-dark-800/90 backdrop-blur-xl border-r border-primary-200/30 dark:border-dark-600/50 min-h-screen"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 border-b border-gray-200/50 dark:border-dark-600/50"
      >
        <motion.h1
          className="text-4xl font-bold gradient-text"
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          WorkTrack
        </motion.h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="p-4 mx-3 mt-4 rounded-2xl bg-gradient-to-r from-primary-500/10 to-purple-500/10 dark:from-primary-500/5 dark:to-purple-500/5 border border-primary-500/10 dark:border-primary-500/20"
      >
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ x: 3 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary-500/20"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </motion.div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </motion.div>
      </motion.div>

      <nav className="flex-1 p-3 mt-3 space-y-1">
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.1 + i * 0.05 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/10 to-purple-500/10 dark:from-primary-500/20 dark:to-purple-500/20 text-primary-700 dark:text-primary-400 border border-primary-500/20 dark:border-primary-500/30 shadow-md shadow-primary-500/5'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 dark:hover:from-dark-700 dark:hover:to-dark-700 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm hover:translate-x-0.5'
                }`
              }
            >
              <motion.div whileHover={{ scale: 1.15 }} transition={{ type: 'spring', stiffness: 400 }}>
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </motion.div>
              <span>{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200/50 dark:border-dark-600/50 space-y-1">
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.03, x: 3 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-purple-50 dark:hover:from-dark-700 dark:hover:to-dark-700 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 group"
        >
          <motion.div
            className="w-5 h-5 flex items-center justify-center"
            whileHover={{ rotate: isDark ? -180 : 180 }}
            transition={{ duration: 0.5 }}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </motion.div>
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </motion.button>

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.03, x: 3 }}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-500/10 dark:hover:to-rose-500/10 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 group"
        >
          <motion.div
            className="w-5 h-5 flex items-center justify-center"
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </motion.div>
          Logout
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
