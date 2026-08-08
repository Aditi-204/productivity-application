import { useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback } from 'react';

const useTilt = ({ maxTilt = 12, springConfig = { stiffness: 300, damping: 30 } } = {}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [-1, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-1, 1], [-maxTilt, maxTilt]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);
    x.set(normX);
    y.set(normY);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    style: {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
    },
    handleMouseMove,
    handleMouseLeave,
  };
};

export default useTilt;
