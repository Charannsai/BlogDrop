import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, variant = 'default', className = '', ...props }, ref) => {
    const baseStyles = 'w-full rounded-lg focus:ring-2 focus:outline-none transition-colors duration-200';
    
    const variantStyles = {
      default: 'border border-gray-300 focus:border-primary-500 focus:ring-primary-200 bg-white',
      filled: 'border border-gray-200 bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-primary-200',
    };
    
    const stateStyles = error
      ? 'border-error-500 focus:border-error-500 focus:ring-error-200'
      : variantStyles[variant];
    
    const inputStyles = `
      ${baseStyles}
      ${stateStyles}
      ${icon ? 'pl-10' : 'pl-4'}
      py-2.5
      ${className}
    `;

    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={inputStyles}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;