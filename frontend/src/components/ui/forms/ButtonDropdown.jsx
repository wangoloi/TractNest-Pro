import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ButtonDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option...",
  disabled = false,
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  size = "md",
  variant = "default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variantClasses = {
    default: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    primary: "bg-blue-500 border border-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 border border-gray-500 text-white hover:bg-gray-600",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between rounded-lg transition-colors
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${buttonClassName}
        `}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp size={16} className="ml-2 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="ml-2 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className={`
          absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
          max-h-60 overflow-y-auto
          ${dropdownClassName}
        `}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`
                w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors
                ${option.value === value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ButtonDropdown;
