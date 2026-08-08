const Spinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${sizes[size]}`}>
        <div className={`absolute inset-0 rounded-full border-2 border-white/[0.06]`} />
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-primary-300 animate-spin`} />
        <div className={`absolute inset-1 rounded-full border-2 border-transparent border-b-accent-300 animate-spin-slow`} />
      </div>
    </div>
  );
};

export default Spinner;
