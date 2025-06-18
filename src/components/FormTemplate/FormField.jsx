import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const FormField = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      value,
      onChange,
      required = false,
      placeholder = "",
      className = "",
      rows,
      options,
      delay = 0,
      error,
      ...props
    },
    ref
  ) => {
    const baseInputClass = `
    w-full px-4 py-3
    border border-[#DBE2EF]
    rounded-md
    bg-white
    transition-all duration-300 ease-in-out
    focus:outline-none 
    focus:border-gray-400
    focus:rounded-xl
    ${error ? "border-red-400" : ""}
    ${className}
  `;

    const formatPhoneNumber = (value) => {
      if (!value) return "";

      // Sadece rakamları al
      const numbers = value.replace(/\D/g, "");

      // Format: 0555 555 55 55
      const match = numbers.match(/^(\d{0,4})(\d{0,3})(\d{0,2})(\d{0,2})$/);

      if (!match) return value;

      let formatted = "";
      if (match[1]) {
        // İlk 4 rakam (başında 0 kontrolü)
        formatted = match[1].startsWith("0") ? match[1] : "0" + match[1];
      }
      if (match[2]) formatted += " " + match[2];
      if (match[3]) formatted += " " + match[3];
      if (match[4]) formatted += " " + match[4];

      return formatted.trim();
    };

    const handlePhoneChange = (e) => {
      if (type === "tel") {
        const formatted = formatPhoneNumber(e.target.value);
        onChange?.({
          ...e,
          target: {
            ...e.target,
            value: formatted,
          },
        });
      } else {
        onChange?.(e);
      }
    };

    const renderInput = () => {
      if (type === "textarea") {
        return (
          <textarea
            ref={ref}
            name={name}
            value={value}
            onChange={handlePhoneChange}
            required={required}
            rows={rows || 3}
            className={baseInputClass}
            placeholder={placeholder}
            {...props}
          />
        );
      }

      if (type === "select") {
        return (
          <select
            ref={ref}
            name={name}
            value={value}
            onChange={handlePhoneChange}
            required={required}
            className={`${baseInputClass} appearance-none bg-no-repeat bg-right-1 pr-10`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23646464'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundSize: "1.5rem",
            }}
            {...props}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      if (type === "tel") {
        return (
          <input
            ref={ref}
            type="text"
            name={name}
            value={value}
            onChange={handlePhoneChange}
            required={required}
            className={baseInputClass}
            placeholder="0555 555 55 55"
            maxLength={14}
            {...props}
          />
        );
      }

      return (
        <input
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={handlePhoneChange}
          required={required}
          className={baseInputClass}
          placeholder={placeholder}
          {...props}
        />
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="group"
      >
        <label className="block text-sm font-medium text-gray-500 mb-2 transition-colors group-focus-within:text-gray-700">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {renderInput()}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
