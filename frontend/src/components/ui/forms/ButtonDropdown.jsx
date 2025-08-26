import React, { useState, useEffect } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react-dom-interactions";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const ButtonDropdown = ({
  buttonContent,
  options = [],
  disabled = false,
  className = "",
  buttonClassName = "",
  onOpenChange = () => {}, // Default to a no-op function
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, reference, floating, strategy, update, refs } = useFloating({
    placement: "bottom",
    middleware: [offset(8), flip(), shift()],
  });

  // Auto-update position on resize/scroll
  useEffect(() => {
    if (!isOpen) return;
    return autoUpdate(refs.reference.current, refs.floating.current, update);
  }, [isOpen, refs.reference, refs.floating, update]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        refs.floating.current &&
        !refs.floating.current.contains(event.target) &&
        refs.reference.current &&
        !refs.reference.current.contains(event.target)
      ) {
        setIsOpen(false);
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, refs.floating, refs.reference, onOpenChange]);

  // Notify parent when dropdown opens/closes
  useEffect(() => {
    onOpenChange(isOpen);
  }, [isOpen, onOpenChange]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={reference}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`
          flex items-center transition-all duration-300
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${buttonClassName}
        `}
        data-button-dropdown="true"
      >
        {buttonContent}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={floating}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 9999,
                minWidth: "10rem",
              }}
              className="bg-white rounded-xl shadow-xl"
              data-button-dropdown="true"
            >
              <div className="p-2">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOpen(false);
                      onOpenChange(false);
                      option.onClick?.(option.value);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left 
                      hover:bg-gray-100 transition-colors duration-200 rounded-md
                      ${option.danger ? "text-red-600" : "text-gray-900"}
                    `}
                  >
                    {option.icon &&
                      React.createElement(option.icon, {
                        className: "h-4 w-4",
                      })}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default ButtonDropdown;
