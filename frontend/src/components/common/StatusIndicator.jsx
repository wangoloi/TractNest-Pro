import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

const StatusIndicator = ({ 
  status = 'online', 
  text, 
  showIcon = true, 
  size = 'sm',
  className = '' 
}) => {
  const statusConfig = {
    online: {
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    offline: {
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: AlertCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    connecting: {
      icon: Wifi,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    }
  };

  const config = statusConfig[status] || statusConfig.online;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className={`inline-flex items-center gap-2 ${sizeClasses[size]} ${config.bgColor} ${config.textColor} border ${config.borderColor} rounded-full ${className}`}>
      {showIcon && (
        <div className="relative">
          <IconComponent size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} />
          {status === 'online' && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
      )}
      {text && <span className="font-medium">{text}</span>}
    </div>
  );
};

export default StatusIndicator;
