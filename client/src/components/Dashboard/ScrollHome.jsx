import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard';
import useAuthStore from '../../store/useAuthStore';

const LazySection = ({ id, index, total, children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-100px 0px' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isInView && !loaded) setLoaded(true);
  }, [isInView, loaded]);

  return (
    <section
      id={id}
      ref={ref}
      className="min-h-screen relative flex items-center justify-center py-32 px-4 lg:px-8"
    >
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      {index > 0 && (
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      )}
      <div className="w-full max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {loaded && children}
          {!loaded && (
            <div className="flex items-center justify-center py-32">
              <div className="w-6 h-6 border-2 border-[#C4B5FD] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex items-center gap-4">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const el = document.getElementById(SECTIONS[i].id);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? 'w-8 bg-gradient-to-r from-[#C4B5FD] to-[#A5F3FC]' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`} />
          </button>
        ))}
        <span className="text-[10px] font-mono text-white/20 ml-2 tracking-widest">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </section>
  );
};

const SECTIONS = [
  { id: 'dashboard', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'email', label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { id: 'attendance', label: 'Attendance', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'reports', label: 'Reports', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
];

const ScrollHome = () => {
  const { user } = useAuthStore();

  const DashboardComponent = () => {
    switch (user?.role) {
      case 'manager': return <ManagerDashboard />;
      case 'admin': return <AdminDashboard />;
      default: return <EmployeeDashboard />;
    }
  };

  return (
    <div className="bg-[#0B0F17]">
      <LazySection id="dashboard" index={0} total={SECTIONS.length}>
        <DashboardComponent />
      </LazySection>

      <LazySection id="email" index={1} total={SECTIONS.length}>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white font-display">Email</h2>
            <p className="text-gray-500 mt-2 text-sm">AI-powered email command center</p>
          </div>
          <AsyncComponent loader={() => import('../Email/EmailPage')} />
        </div>
      </LazySection>

      <LazySection id="tasks" index={2} total={SECTIONS.length}>
        <AsyncComponent loader={() => import('../Todo/TodoList')} />
      </LazySection>

      <LazySection id="attendance" index={3} total={SECTIONS.length}>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white font-display">Attendance</h2>
            <p className="text-gray-500 mt-2 text-sm">Track your attendance and work patterns</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AsyncComponent loader={() => import('../Attendance/AttendanceCalendar')} />
            <AsyncComponent loader={() => import('../Charts/AttendanceBreakdown')} />
            <div className="lg:col-span-2">
              <AsyncComponent loader={() => import('../Attendance/AttendanceHistory')} />
            </div>
          </div>
        </div>
      </LazySection>

      <LazySection id="analytics" index={4} total={SECTIONS.length}>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white font-display">Analytics</h2>
            <p className="text-gray-500 mt-2 text-sm">Your productivity insights at a glance</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LazyCard title="Task Completion">
              <AsyncComponent loader={() => import('../Charts/ProductivityChart')} />
            </LazyCard>
            <AsyncComponent loader={() => import('../Charts/AttendanceBreakdown')} />
            <div className="lg:col-span-2">
              <LazyCard title="Activity">
                <AsyncComponent loader={() => import('../Charts/HeatmapCalendar')} />
              </LazyCard>
            </div>
          </div>
        </div>
      </LazySection>

      <LazySection id="reports" index={5} total={SECTIONS.length}>
        <AsyncComponent loader={() => import('../Reports/ReportPage')} />
      </LazySection>

      <footer className="py-16 text-center bg-[#0B0F17]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <p className="text-[10px] text-gray-600 font-mono tracking-[0.3em]">
            WORKFLOW — NEXT-GEN PRODUCTIVITY PLATFORM
          </p>
        </div>
      </footer>
    </div>
  );
};

const AsyncComponent = ({ loader }) => {
  const [Comp, setComp] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-50px 0px' });

  useEffect(() => {
    if (isInView && !Comp) {
      loader().then(mod => setComp(() => mod.default || mod));
    }
  }, [isInView, Comp]);

  return (
    <div ref={ref}>
      {Comp ? <Comp /> : (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[#C4B5FD] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

const LazyCard = ({ title, children }) => (
  <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
    <h2 className="text-lg font-semibold text-gray-100 mb-4 font-display">{title}</h2>
    {children}
  </div>
);

export default ScrollHome;
