import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CustomDropdown = ({
  value,
  onChange,
  options,
  label,
  required = false,
  error,
  delay = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="group relative"
      ref={dropdownRef}
    >
      <label className="block text-sm font-medium text-gray-500 mb-2 transition-colors group-focus-within:text-gray-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      <div
        className={`
          w-full px-4 py-3
          border border-[#DBE2EF]
          rounded-md
          bg-white
          transition-all duration-300 ease-in-out
          focus:outline-none 
          focus:border-gray-400
          cursor-pointer
          flex justify-between items-center
          ${isOpen ? "rounded-b-none" : ""}
          ${error ? "border-red-500" : ""}
          group-focus-within:border-gray-400
          group-focus-within:rounded-xl
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-gray-700 ${!selectedOption && "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : "Seçiniz"}
        </span>

        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full bg-white border border-t-0 border-[#DBE2EF] rounded-b-md shadow-lg"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`
                  px-4 py-2 
                  hover:bg-gray-50 
                  cursor-pointer 
                  transition-colors
                  ${option.value === value ? "bg-blue-50 text-blue-600" : ""}
                `}
                onClick={() => {
                  onChange({
                    target: {
                      value: option.value,
                    },
                  });
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default CustomDropdown;
