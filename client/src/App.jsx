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
  initial: { opacity: 0, y: 30, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(6px)' },
};

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="bg-[#0B0F17] min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 mesh-gradient pointer-events-none" />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="fixed inset-0 noise-bg pointer-events-none" />
      <TopBar />
      <NavArrows />
      <ScrollHome />
    </div>
  );
};

const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <Outlet />
    </>
  );
};

const App = () => {
  const { initTheme } = useThemeStore();
  const location = useLocation();

  useEffect(() => { initTheme(); }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: 'rgba(20, 28, 41, 0.95)',
            backdropFilter: 'blur(20px)',
            color: '#fff',
            fontSize: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
          },
          success: { iconTheme: { primary: '#A7F3D0', secondary: '#0B0F17' } },
          error: { iconTheme: { primary: '#F9A8D4', secondary: '#0B0F17' } },
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={pageTrans}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 220, damping: 25, mass: 0.8 }}
        >
          <Routes location={location} key={location.pathname}>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
            </Route>
            <Route path="/dashboard" element={<ProtectedRoute />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
