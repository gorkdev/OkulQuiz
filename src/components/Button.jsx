import React from "react";
import { motion } from "framer-motion";

const Button = ({
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
}) => {
  // Variant styles
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-300",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 shadow-gray-300",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-green-300",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-red-300",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-200",
    outline:
      "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-blue-100",
  };

  // Size styles
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97, y: 2, transition: { duration: 0.1 } }}
      className={`
        relative
        inline-flex items-center justify-center
        font-semibold
        rounded-lg
        transform-gpu
        transition-all duration-200
        shadow-lg hover:shadow-xl
        disabled:opacity-70 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {/* Normal state content */}
      <span
        className={`
          inline-flex items-center gap-2
          ${loading ? "invisible" : ""}
        `}
      >
        {Icon && iconPosition === "left" && <Icon className="w-5 h-5" />}
        {children}
        {Icon && iconPosition === "right" && <Icon className="w-5 h-5" />}
      </span>

      {/* Loading state overlay */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <LoadingSpinner />
          {loadingText}
        </span>
      )}
    </motion.button>
  );
};

export default Button;
