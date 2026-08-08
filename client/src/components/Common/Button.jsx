import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  secondary: 'glass text-gray-200 hover:bg-white/[0.08] hover:border-white/[0.12]',
  danger: 'bg-gradient-to-r from-red-600 to-rose-500 text-white hover:shadow-[0_0_30px_rgba(225,29,72,0.3)]',
  ghost: 'bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]',
  outline: 'border border-white/[0.12] text-gray-300 hover:bg-white/[0.05] hover:border-primary-300/50 hover:text-primary-300',
  premium: 'bg-gradient-to-r from-[#C4B5FD] via-[#A5F3FC] to-[#A7F3D0] text-[#0B0F17] font-bold hover:shadow-[0_0_40px_rgba(165,243,252,0.3)]',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
  xl: 'px-10 py-5 text-lg',
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
  magnetic = true,
  ...props
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`relative overflow-hidden inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed group ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
