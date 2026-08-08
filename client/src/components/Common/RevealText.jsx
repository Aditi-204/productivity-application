import { motion } from 'framer-motion';

const RevealText = ({ children, className = '', delay = 0, as: Tag = 'h1' }) => (
  <div className={`overflow-hidden ${className}`}>
    <motion.div
      initial={{ y: '120%', rotateX: -20, opacity: 0 }}
      animate={{ y: 0, rotateX: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 18,
        delay,
      }}
      style={{ transformOrigin: 'bottom center', perspective: 800 }}
    >
      <Tag>{children}</Tag>
    </motion.div>
  </div>
);

export default RevealText;
