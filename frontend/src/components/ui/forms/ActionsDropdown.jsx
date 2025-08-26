import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ActionsDropdown = ({
  actions = [],
  trigger = <MoreHorizontal size={16} />,
  className = "",
  size = "sm",
  position = "bottom-right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate dropdown position based on trigger position
  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 192; // min-w-48 = 12rem = 192px
    const dropdownHeight = actions.length * 40 + 8; // Approximate height

    let top, left;

    switch (position) {
      case "bottom-right":
        top = triggerRect.bottom + window.scrollY + 4;
        left = triggerRect.left + window.scrollX;
        break;
      case "bottom-left":
        top = triggerRect.bottom + window.scrollY + 4;
        left = triggerRect.right + window.scrollX - dropdownWidth;
        break;
      case "top-right":
        top = triggerRect.top + window.scrollY - dropdownHeight - 4;
        left = triggerRect.left + window.scrollX;
        break;
      case "top-left":
        top = triggerRect.top + window.scrollY - dropdownHeight - 4;
        left = triggerRect.right + window.scrollX - dropdownWidth;
        break;
      default:
        top = triggerRect.bottom + window.scrollY + 4;
        left = triggerRect.left + window.scrollX;
    }

    // Ensure dropdown doesn't go off-screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if needed
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 8;
    }
    if (left < 8) {
      left = 8;
    }

    // Adjust vertical position if needed
    if (
      position.startsWith("bottom") &&
      top + dropdownHeight > viewportHeight + window.scrollY
    ) {
      // Switch to top positioning
      top = triggerRect.top + window.scrollY - dropdownHeight - 4;
    } else if (position.startsWith("top") && top < window.scrollY) {
      // Switch to bottom positioning
      top = triggerRect.bottom + window.scrollY + 4;
    }

    setDropdownPosition({ top, left });
  };

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  // Size classes
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${className}`}
        title="Actions"
        data-actions-dropdown="true"
      >
        {trigger}
      </button>

      {/* Dropdown Menu - Portal to body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed z-50 min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            data-actions-dropdown="true"
          >
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => handleActionClick(action, e)}
                  disabled={action.disabled}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 text-left transition-colors
                    ${sizeClasses[size]}
                    ${
                      action.disabled
                        ? "text-gray-400 cursor-not-allowed"
                        : action.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                    ${action.divider ? "border-t border-gray-100" : ""}
                  `}
                  data-actions-dropdown="true"
                >
                  <div className="flex items-center gap-3">
                    {action.icon && (
                      <span className="flex-shrink-0">{action.icon}</span>
                    )}
                    <span>{action.label}</span>
                  </div>
                  {action.shortcut && (
                    <span className="text-xs text-gray-400 ml-2">
                      {action.shortcut}
                    </span>
                  )}
                  {action.submenu && (
                    <ChevronRight size={14} className="text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ActionsDropdown;
