import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isFullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isFullWidth = false,
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  className = '',
}) => {
  const baseClasses = 'rounded-md font-medium inline-flex items-center justify-center transition-all duration-200 gap-2';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const widthClass = isFullWidth ? 'w-full' : '';
  
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;