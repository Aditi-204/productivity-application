import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard';
import useAuthStore from '../../store/useAuthStore';

const sectionList = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'reports', label: 'Reports' },
];

const ScrollHome = () => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const handleSectionSync = () => {
      const current = sectionList.find((section) => {
        const el = document.getElementById(section.id);
        if (!el) return false;

        const rect = el.getBoundingClientRect();
        return rect.top <= 160 && rect.bottom >= 160;
      });

      if (current) setActiveSection(current.id);
    };

    const onScroll = () => handleSectionSync();
    window.addEventListener('scroll', onScroll, { passive: true });
    handleSectionSync();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const DashboardComponent = () => {
    switch (user?.role) {
      case 'manager':
        return <ManagerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'tasks':
        return (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <TodoPage />
          </motion.div>
        );

      case 'attendance':
        return (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <AttendancePage />
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <AnalyticsPage />
          </motion.div>
        );

      case 'reports':
        return (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <ReportsPage />
          </motion.div>
        );

      default:
        return (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <DashboardComponent />
          </motion.div>
        );
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-8 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {sectionList.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              const target = document.getElementById(section.id);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={`rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${
              activeSection === section.id
                ? 'border-violet-400/40 bg-violet-500/10 text-violet-200'
                : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">{renderSection()}</AnimatePresence>
      </div>

      <div id="dashboard" className="h-px w-full opacity-0" />
      <div id="tasks" className="h-px w-full opacity-0" />
      <div id="attendance" className="h-px w-full opacity-0" />
      <div id="analytics" className="h-px w-full opacity-0" />
      <div id="reports" className="h-px w-full opacity-0" />
    </div>
  );
};

const TodoPage = () => {
  return (
    <div className="section-shell p-6">
      <h2 className="mb-4 text-3xl font-semibold text-white">Tasks</h2>
      <p className="mb-6 text-slate-400">Plan, prioritize, and complete the work that matters most.</p>
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-slate-300">Task page imported from existing Todo components.</p>
      </div>
    </div>
  );
};

const AttendancePage = () => {
  return (
    <div className="section-shell p-6">
      <h2 className="mb-4 text-3xl font-semibold text-white">Attendance</h2>
      <p className="mb-6 text-slate-400">Monitor presence, punctuality, and working pattern across the team.</p>
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-slate-300">Attendance view imported from existing attendance components.</p>
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  return (
    <div className="section-shell p-6">
      <h2 className="mb-4 text-3xl font-semibold text-white">Analytics</h2>
      <p className="mb-6 text-slate-400">Track productivity, consistency, and work velocity.</p>
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-slate-300">Analytics view imported from your chart modules.</p>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  return (
    <div className="section-shell p-6">
      <h2 className="mb-4 text-3xl font-semibold text-white">Reports</h2>
      <p className="mb-6 text-slate-400">Review performance summaries and end-of-day updates.</p>
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-slate-300">Report page imported from existing reports components.</p>
      </div>
    </div>
  );
};

export default ScrollHome;
