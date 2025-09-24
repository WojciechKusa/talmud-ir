// components/UI/LoadingSpinner.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading...", size = 24 }) => {
  return (
    <div className="flex items-center gap-3 text-amber-800">
      <RefreshCw className="animate-spin" size={size} />
      <span className="text-lg">{message}</span>
    </div>
  );
};

export default LoadingSpinner;

// components/UI/ErrorMessage.jsx
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 max-w-md mx-auto text-center">
      <div className="flex items-center justify-center mb-4">
        <AlertCircle className="text-red-500" size={32} />
      </div>
      
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error Loading Data
      </h3>
      
      <p className="text-red-700 mb-4 text-sm">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

// components/UI/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  icon,
  className = '',
  ...props 
}) => {
  const baseClasses = "flex items-center gap-2 rounded-lg transition-colors font-medium";
  
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-50"
  };
  
  const sizes = {
    small: "px-3 py-1 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;