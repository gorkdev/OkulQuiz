import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const UsersLayout = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const linkBase = "text-gray-700 font-medium px-3 py-2 rounded";

  return (
    <div className="min-h-screen overflow-y-scroll bg-gradient-to-br from-white via-blue-50 to-white flex flex-col">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm border-b border-gray-100"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-[1526px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/home"
              className="text-2xl font-bold text-blue-500 tracking-tight select-none"
            >
              MinikUP
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-2"
            aria-label="Primary Navigation"
          >
            <NavLink to="/home" end className={linkBase}>
              Ana Sayfa
            </NavLink>
            <NavLink to="/home/quiz" className={linkBase}>
              Quiz
            </NavLink>
            <NavLink to="/home/profile" className={linkBase}>
              Profil
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="hidden md:inline-flex bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded transition-colors font-medium shadow-sm"
            >
              Çıkış
            </button>
            {/* Mobile menu button */}
            <button
              aria-label="Menüyü aç/kapat"
              aria-expanded={menuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen((p) => !p)}
            >
              <svg
                x="0px"
                y="0px"
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Animated full screen drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.aside
              key="mobile-menu"
              className="md:hidden fixed inset-0 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMenuOpen(false)}
              />
              {/* Drawer */}
              <motion.nav
                className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl p-6 flex flex-col"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                aria-label="Mobil menü"
              >
                <div className="flex items-center justify-between mb-4">
                  <Link
                    to="/home"
                    className="text-xl font-bold text-blue-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    MinikUP
                  </Link>
                  <button
                    aria-label="Menüyü kapat"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/home"
                    end
                    className={linkBase}
                    onClick={() => setMenuOpen(false)}
                  >
                    Ana Sayfa
                  </NavLink>
                  <NavLink
                    to="/home/quiz"
                    className={linkBase}
                    onClick={() => setMenuOpen(false)}
                  >
                    Quiz
                  </NavLink>
                  <NavLink
                    to="/home/profile"
                    className={linkBase}
                    onClick={() => setMenuOpen(false)}
                  >
                    Profil
                  </NavLink>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="mt-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors font-medium shadow-sm text-left"
                  >
                    Çıkış
                  </button>
                </div>
              </motion.nav>
            </motion.aside>
          )}
        </AnimatePresence>
      </motion.header>
      {/* İçerik */}
      <main className="flex-1 w-full max-w-[1526px] mx-auto px-4 py-8">
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 text-center py-4 text-sm text-gray-400">
        MinikUP © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default UsersLayout;
