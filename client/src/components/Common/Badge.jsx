const variantStyles = {
  gray: 'bg-white/[0.05] text-gray-400 border-white/[0.06]',
  primary: 'bg-primary-500/10 text-primary-300 border-primary-500/20',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-300 border-red-500/20',
  info: 'bg-accent-500/10 text-accent-300 border-accent-500/20',
  premium: 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300 border-primary-500/20',
};

const Badge = ({ children, variant = 'gray', className = '', dot = false }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-emerald-400' : variant === 'warning' ? 'bg-amber-400' : variant === 'danger' ? 'bg-red-400' : variant === 'primary' ? 'bg-primary-400' : 'bg-gray-400'}`} />}
    {children}
  </span>
);

export default Badge;
