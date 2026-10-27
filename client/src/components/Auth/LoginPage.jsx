import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';
import TopBar from './components/Navigation/TopBar';
import NavArrows from './components/Navigation/NavArrows';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import OAuthCallback from './components/Auth/OAuthCallback';
import ScrollHome from './components/Dashboard/ScrollHome';

const pageTrans = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b1020] text-slate-100">
      <div className="mesh-bg fixed inset-0 pointer-events-none" />
      <div className="noise-bg fixed inset-0 pointer-events-none" />
      <div className="relative z-10">
        <TopBar />
        <main className="pt-24">
          <ScrollHome />
        </main>
      </div>
    </div>
  );
};

const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

const App = () => {
  const { initTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            color: '#f8fafc',
            boxShadow: '0 14px 30px rgba(2, 6, 23, 0.35)',
          },
          success: { iconTheme: { primary: '#7EE7D2', secondary: '#0b1020' } },
          error: { iconTheme: { primary: '#FB7185', secondary: '#0b1020' } }
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageTrans}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="min-h-screen"
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
            </Route>
            <Route path="/dashboard" element={<ProtectedRoute />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
