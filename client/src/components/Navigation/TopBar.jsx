import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'reports', label: 'Reports' },
];

const notificationSeed = [
  {
    id: 1,
    title: 'Task reminder',
    message: 'Your design review is due in 45 minutes.',
    time: '2m ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Attendance marked',
    message: 'Your attendance was recorded successfully.',
    time: '18m ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Weekly report ready',
    message: 'Your productivity summary is ready to review.',
    time: '1h ago',
    unread: false,
  },
];

const TopBar = () => {
  const { user, logout } = useAuthStore();
  const { isTechMode, toggleTechMode } = useThemeStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = useMemo(() => notificationSeed, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToSection = (id) => {
    setMobileOpen(false);
    setNotifOpen(false);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className="mx-auto max-w-7xl px-4 pt-4 lg:px-6">
          <div className="glass-panel flex items-center justify-between rounded-[22px] px-3 py-3">
            <button
              onClick={() => goToSection('dashboard')}
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-purple-400 to-cyan-400 text-sm font-bold text-slate-950 shadow-[0_12px_30px_rgba(139,92,246,0.35)]">
                W
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-sm font-semibold text-white">Workflow</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Workspace</div>
              </div>
            </button>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToSection(item.id)}
                  className="nav-link"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTechMode}
                aria-label="Toggle techno mode"
                className={`tech-toggle ${isTechMode ? 'active' : ''}`}
              >
                <span className="thumb" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Notifications"
                >
                  🔔
                </button>

                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-white">
                  {notifications.filter((n) => n.unread).length}
                </span>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 top-12 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-[0_25px_60px_rgba(2,6,23,0.5)]"
                    >
                      <div className="mb-2 flex items-center justify-between px-2">
                        <p className="text-sm font-semibold text-white">Notifications</p>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                          {notifications.filter((n) => n.unread).length} new
                        </span>
                      </div>

                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`rounded-xl border px-3 py-2 ${
                              notification.unread
                                ? 'border-violet-500/20 bg-violet-500/5'
                                : 'border-white/5 bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium text-white">{notification.title}</p>
                              {notification.unread && (
                                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
                              )}
                            </div>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                              {notification.time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-200"
              >
                Logout
              </button>

              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-slate-950 md:hidden"
                onClick={() => setMobileOpen((v) => !v)}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-4 top-20 z-50 md:hidden"
          >
            <div className="glass-panel rounded-[20px] p-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToSection(item.id)}
                  className="flex w-full items-center justify-start rounded-xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopBar;
