import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({ label, error, className = '', icon, ...props }, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
        </motion.label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary-300 transition-colors duration-300">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`block w-full rounded-2xl border bg-white/[0.03] backdrop-blur-xl px-5 py-3.5 text-sm shadow-lg transition-all duration-300 placeholder:text-gray-600 focus:outline-none ${
            error
              ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
              : 'border-white/[0.08] hover:border-white/[0.15] focus:border-primary-300/50 focus:ring-2 focus:ring-primary-500/20'
          } ${icon ? 'pl-12' : ''} ${className}`}
          {...props}
        />
        <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary-300/50 to-transparent transition-opacity duration-500 ${focused ? 'opacity-100' : 'opacity-0'}`} />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-red-400 flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
