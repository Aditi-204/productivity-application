
import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 block text-sm font-medium text-slate-300"
        >
          {label}
        </motion.label>
      )}

      <div className="relative">
        <input
          ref={ref}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`input-shell ${error ? 'border-rose-500/50 focus:border-rose-400 focus:ring-rose-500/15' : ''} ${className}`}
          {...props}
        />

        <div
          className={`absolute left-4 right-4 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent transition-opacity duration-300 ${
            focused ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-rose-300"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
