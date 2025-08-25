import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm hover:shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm hover:shadow-md',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    link: 'text-blue-600 hover:text-blue-800 underline focus:ring-blue-500'
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = [
    baseClasses,
    variants[variant],
    sizes[size],
    widthClass,
    className
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (loading) {
      return <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="animate-spin" />;
    }
    if (Icon) {
      return <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />;
    }
    return null;
  };

  const renderContent = () => {
    const icon = renderIcon();
    
    if (!icon) return children;
    
    if (iconPosition === 'left') {
      return (
        <>
          {icon}
          {children && <span className={icon ? 'ml-2' : ''}>{children}</span>}
        </>
      );
    }
    
    return (
      <>
        {children && <span className={icon ? 'mr-2' : ''}>{children}</span>}
        {icon}
      </>
    );
  };

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
