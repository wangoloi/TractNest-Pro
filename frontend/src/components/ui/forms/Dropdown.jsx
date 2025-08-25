import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  searchable = true,
  disabled = false,
  className = '',
  size = 'md',
  error = false,
  loading = false,
  multiple = false,
  maxHeight = '200px'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState(multiple ? (value || []) : []);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-4 py-3'
  };

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    if (!searchable || !searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const label = typeof option === 'string' ? option : option.label || option.name || option.value;
    const value = typeof option === 'string' ? option : option.value;
    
    return label.toLowerCase().includes(searchLower) || 
           value.toString().toLowerCase().includes(searchLower);
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  // Update selected items when value prop changes
  useEffect(() => {
    if (multiple) {
      setSelectedItems(value || []);
    }
  }, [value, multiple]);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm('');
      }
    }
  };

  const handleSelect = useCallback((option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    const optionLabel = typeof option === 'string' ? option : option.label || option.name || option.value;

    if (multiple) {
      const newSelectedItems = selectedItems.includes(optionValue)
        ? selectedItems.filter(item => item !== optionValue)
        : [...selectedItems, optionValue];
      
      setSelectedItems(newSelectedItems);
      onChange?.(newSelectedItems);
    } else {
      onChange?.(optionValue, option);
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [multiple, selectedItems, onChange]);

  const getDisplayValue = () => {
    if (multiple) {
      if (selectedItems.length === 0) return placeholder;
      if (selectedItems.length === 1) {
        const option = options.find(opt => {
          const optValue = typeof opt === 'string' ? opt : opt.value;
          return optValue === selectedItems[0];
        });
        return typeof option === 'string' ? option : option?.label || option?.name || option?.value;
      }
      return `${selectedItems.length} items selected`;
    } else {
      if (!value) return placeholder;
      const option = options.find(opt => {
        const optValue = typeof opt === 'string' ? opt : opt.value;
        return optValue === value;
      });
      return typeof option === 'string' ? option : option?.label || option?.name || option?.value;
    }
  };

  const isSelected = (option) => {
    const optionValue = typeof option === 'string' ? option : option.value;
    if (multiple) {
      return selectedItems.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        className={`
          w-full flex items-center justify-between rounded-lg border transition-all duration-200
          ${sizeClasses[size]}
          ${disabled || loading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-900 cursor-pointer hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-20'
          }
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'border-green-500 ring-2 ring-green-500 ring-opacity-20' : ''}
        `}
      >
        <span className={`truncate ${!value && !selectedItems.length ? 'text-gray-500' : ''}`}>
          {loading ? 'Loading...' : getDisplayValue()}
        </span>
        <ChevronDown 
          size={16} 
          className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div 
              className="overflow-y-auto"
              style={{ maxHeight }}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label || option.name || option.value;
                  const selected = isSelected(option);

                  return (
                    <button
                      key={optionValue}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors
                        ${selected 
                          ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
                          : 'hover:bg-gray-50 text-gray-900'
                        }
                        ${multiple ? 'border-l-4' : ''}
                        ${selected && !multiple ? 'border-l-4 border-green-500' : ''}
                      `}
                    >
                      <span className="truncate">{optionLabel}</span>
                      {selected && (
                        <Check size={16} className="text-green-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  {searchTerm ? 'No options found' : 'No options available'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
