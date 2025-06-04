import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiSettings,
  FiBell,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";
import ProfileButton from "./ProfileButton";

const AdminHeader = ({ title, children }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef(null);

  // Dışarı tıklanınca dropdown'ı kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="mb-8 mt-4 md:mt-0 flex-row flex md:flex-row items-start md:items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div ref={avatarRef} className="relative">
          <button
            className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="Profil Menüsü"
          >
            A
          </button>
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden"
              >
                <ProfileButton
                  icon={FiUser}
                  className="hover:bg-blue-50 text-gray-700"
                >
                  Profilim
                </ProfileButton>
                <ProfileButton
                  icon={FiSettings}
                  className="hover:bg-blue-50 text-gray-700"
                >
                  Ayarlar
                </ProfileButton>
                <ProfileButton
                  icon={FiBell}
                  className="hover:bg-blue-50 text-gray-700"
                >
                  Bildirimler
                </ProfileButton>
                <ProfileButton
                  icon={FiHelpCircle}
                  className="hover:bg-blue-50 text-gray-700"
                >
                  Yardım
                </ProfileButton>
                <div className="border-t border-gray-100 my-1" />
                <ProfileButton
                  icon={FiLogOut}
                  className="hover:bg-red-50 text-red-600"
                >
                  Çıkış Yap
                </ProfileButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {children}
    </header>
  );
};

export default AdminHeader;
