import React, { forwardRef } from 'react';

type InputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  id: string;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    type = 'text', 
    placeholder, 
    error, 
    id, 
    name, 
    value, 
    onChange, 
    required = false, 
    disabled = false,
    className = '' 
  }, ref) => {
    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${
            error 
              ? 'border-error-500 focus:ring-error-500' 
              : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;