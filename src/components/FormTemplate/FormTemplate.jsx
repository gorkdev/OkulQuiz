import React from "react";
import { motion } from "framer-motion";

const FormTemplate = ({
  title,
  onSubmit,
  loading,
  children,
  submitText = "Kaydet",
  loadingText = "Kaydediliyor...",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl bg-white rounded-xl shadow-lg p-6 md:p-8"
    >
      {title && (
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{title}</h2>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end pt-6"
        >
          <button
            type="submit"
            disabled={loading}
            className={`px-6 cursor-pointer py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-lg 
              ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700 hover:scale-105"
              } 
              transition-all duration-200`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
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
                {loadingText}
              </span>
            ) : (
              submitText
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default FormTemplate;
