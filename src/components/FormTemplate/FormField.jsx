import React, { forwardRef, useState, useEffect } from "react";
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
    const [displayValue, setDisplayValue] = useState("");

    useEffect(() => {
      if (type === "date" && value) {
        // ISO formatındaki tarihi dd/MM/yyyy formatına çevir
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const day = date.getDate().toString().padStart(2, "0");
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const year = date.getFullYear();
          setDisplayValue(`${day}/${month}/${year}`);
        }
      }
    }, [value, type]);

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

    const formatDateInput = (input) => {
      // Tüm non-digit karakterleri kaldır
      let numbers = input.replace(/\D/g, "");

      // Gereksiz sıfırları kaldır (örneğin 00/05/2023 -> 0/05/2023)
      if (numbers.length > 0 && numbers[0] === "0" && numbers[1] === "0") {
        numbers = numbers.substring(1);
      }

      // Girdiyi parçalara ayır
      let day = numbers.substring(0, 2);
      let month = numbers.substring(2, 4);
      let year = numbers.substring(4, 8);

      // Formatı oluştur
      let formatted = "";
      if (day.length > 0) {
        formatted = day;
        if (month.length > 0) {
          formatted += `/${month}`;
          if (year.length > 0) {
            formatted += `/${year}`;
          }
        }
      }

      return formatted;
    };

    const parseDateString = (dateString) => {
      if (!dateString) return null;

      const parts = dateString.split("/");
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      // Geçerli bir tarih mi kontrol et
      const date = new Date(year, month, day);
      if (
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
      ) {
        return null;
      }

      return date;
    };

    const handleChange = (e) => {
      const value = e.target.value;

      if (type === "date") {
        const formatted = formatDateInput(value);
        setDisplayValue(formatted);

        // Tarihi parse et ve ISO formatına çevir
        const parsedDate = parseDateString(formatted);
        if (parsedDate) {
          const isoDate = parsedDate.toISOString().split("T")[0];
          onChange?.({
            ...e,
            target: {
              ...e.target,
              value: isoDate,
            },
          });
        } else if (formatted.length === 10) {
          // Geçersiz tarih ama tam uzunlukta
          onChange?.({
            ...e,
            target: {
              ...e.target,
              value: "",
            },
          });
        }
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
          value={type === "date" ? displayValue : value}
          onChange={handleChange}
          required={required}
          className={baseInputClass}
          placeholder={type === "date" ? "dd/MM/yyyy" : placeholder}
          maxLength={type === "date" ? 10 : undefined}
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
