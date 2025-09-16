import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

const ActionDropdown = ({
  options = [],
  buttonContent = <MoreHorizontal size={16} />,
  buttonClassName = "",
  dropdownClassName = "",
  disabled = false
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

  const handleOptionClick = (option) => {
    if (option.onClick) {
      option.onClick();
    }
    setIsOpen(false);
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${dropdownClassName}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${buttonClassName}
        `}
        data-button-dropdown
      >
        {buttonContent}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`
                  w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors
                  ${option.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'}
                `}
              >
                {Icon && <Icon size={16} />}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;






