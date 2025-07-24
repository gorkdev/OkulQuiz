import React from "react";

const CustomRadio = ({
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
          type="radio"
          checked={checked}
          onChange={onChange}
          name={name}
          value={value}
          className="peer appearance-none w-5 h-5 rounded-full border-2 border-blue-400 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        />
        <span className="pointer-events-none absolute left-0 top-0 w-5 h-5 rounded-full border-2 border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-colors"></span>
        {checked && (
          <span className="absolute left-1 top-1 w-3 h-3 rounded-full bg-white border-2 border-blue-600"></span>
        )}
      </span>
      <span className="select-none text-gray-700">{label}</span>
    </label>
  );
};

export default CustomRadio;
