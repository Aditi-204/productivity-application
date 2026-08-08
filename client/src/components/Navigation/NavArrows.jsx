import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SECTION_IDS = ['dashboard', 'email', 'tasks', 'attendance', 'analytics', 'reports'];

const NavArrows = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = SECTION_IDS.indexOf(entry.target.id);
            if (idx >= 0) setActiveIdx(idx);
          }
        }
      },
      { threshold: 0.3 }
    );

    const els = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const hasPrev = activeIdx > 0;
  const hasNext = activeIdx < SECTION_IDS.length - 1;

  const go = (dir) => {
    const next = activeIdx + dir;
    if (next >= 0 && next < SECTION_IDS.length) {
      const el = document.getElementById(SECTION_IDS[next]);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: hasPrev ? 1 : 0, x: hasPrev ? 0 : -20 }}
        onClick={() => go(-1)}
        whileHover={{ scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.92 }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-white/[0.12] transition-all"
        style={{ pointerEvents: hasPrev ? 'auto' : 'none' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: hasNext ? 1 : 0, x: hasNext ? 0 : 20 }}
        onClick={() => go(1)}
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.92 }}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full glass-strong flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-white/[0.12] transition-all"
        style={{ pointerEvents: hasNext ? 'auto' : 'none' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    </>
  );
};

export default NavArrows;
