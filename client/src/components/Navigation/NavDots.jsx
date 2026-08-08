import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGES } from '../../hooks/useScrollNavigation';

const labels = ['Dashboard', 'Tasks', 'Attendance', 'Analytics', 'Reports'];

const NavDots = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeIdx = PAGES.indexOf(location.pathname);

  if (activeIdx === -1) return null;

  return (
    <nav className="fixed right-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-3">
      <div className="relative flex flex-col items-center gap-3 py-3 px-2 rounded-full bg-white/60 dark:bg-dark-800/50 backdrop-blur-md border border-primary-200/20 dark:border-dark-600/30 shadow-lg">
        {PAGES.map((path, i) => {
          const isActive = i === activeIdx;
          return (
            <motion.button
              key={path}
              onClick={() => navigate(path, { state: { dir: i > activeIdx ? 1 : -1 } })}
              className="relative flex items-center"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className={`rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/30'
                    : 'bg-gray-300 dark:bg-dark-500 hover:bg-primary-300 dark:hover:bg-primary-600'
                }`}
                animate={{
                  width: isActive ? 10 : 6,
                  height: isActive ? 10 : 6,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              />
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute -right-3 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-accent-500 to-amber-500 shadow-lg shadow-accent-500/50"
                  />
                )}
              </AnimatePresence>
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute right-8 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white/80 dark:bg-dark-700/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-200/50 dark:border-dark-600/30 whitespace-nowrap pointer-events-none"
              >
                {labels[i]}
              </motion.span>
            </motion.button>
          );
        })}
        <div className="absolute inset-0 pointer-events-none">
          {PAGES.map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 w-px bg-gray-200 dark:bg-dark-500 -translate-x-1/2"
              style={{
                top: `calc(${i * 40 + 18}px)`,
                height: i < PAGES.length - 1 ? '24px' : '0',
              }}
            />
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavDots;
