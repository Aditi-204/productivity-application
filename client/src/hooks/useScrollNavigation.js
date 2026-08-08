import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const PAGES = ['/dashboard', '/email', '/tasks', '/attendance', '/analytics', '/reports'];

const useNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastNav = useRef(0);

  const goTo = useCallback((dir) => {
    const now = Date.now();
    if (now - lastNav.current < 1000) return;
    lastNav.current = now;

    const idx = PAGES.indexOf(location.pathname);
    if (idx === -1) return;

    const next = idx + dir;
    if (next < 0 || next >= PAGES.length) return;

    navigate(PAGES[next], { state: { dir } });
  }, [location.pathname, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const idx = PAGES.indexOf(location.pathname);
      if (idx === -1) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(1);
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') goTo(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goTo, location.pathname]);

  return { goTo, activeIdx: PAGES.indexOf(location.pathname) };
};

export default useNav;
