import React from "react";

const CustomCheckbox = ({
  checked,
  onChange,
  label,
  name,
  value,
  className = "",
}) => {
  return (
    <label
      className={`inline-flex items-center cursor-pointer gap-2 ${className}`}
    >
      <span className="relative flex items-center justify-center w-5 h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          name={name}
          value={value}
          className="peer appearance-none w-5 h-5 rounded border-2 border-blue-400 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        />
        <span className="pointer-events-none absolute left-0 top-0 w-5 h-5 rounded border-2 border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-colors"></span>
        {checked && (
          <svg
            className="absolute left-0 top-0 w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      <span className="select-none text-gray-700">{label}</span>
    </label>
  );
};

export default CustomCheckbox;
