import React from "react";

const ProfileButton = ({ icon: Icon, children, onClick, className = "" }) => (
  <button
    className={`w-full flex items-center gap-2 text-left px-4 py-2 text-sm cursor-pointer transition-colors ${className}`}
    onClick={onClick}
    type="button"
  >
    {Icon && <Icon size={17} />}
    {children}
  </button>
);

export default ProfileButton;
