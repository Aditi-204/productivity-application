import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-[0_18px_34px_rgba(139,92,246,0.35)]',
  secondary: 'border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]',
  danger: 'bg-gradient-to-r from-rose-500 to-red-500 text-white',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/[0.04]',
  outline: 'border border-violet-400/30 text-violet-200 hover:bg-violet-500/10',
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-7 py-3.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { y: -1, scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.99 } : {}}
      className={`inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
