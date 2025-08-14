import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helper?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon: Icon,
  helper,
  className = '',
  ...props
}, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            input-field
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-neutral-500">
          {helper}
        </p>
      )}
    </motion.div>
  );
});

Input.displayName = 'Input';

export default Input;
