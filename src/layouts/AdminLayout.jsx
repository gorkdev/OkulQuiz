import { Outlet, NavLink } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { MdOutlinePersonAdd, MdOutlinePeopleAlt } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { menuItems } from "../pages/admin/Sidebar/menuItems";

const AdminLayout = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="admin-layout flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 hidden md:block">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">
          Yönetim Paneli
        </h2>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="flex items-center w-full gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium focus:outline-none group"
                  >
                    <span>{item.icon}</span>
                    {item.name}
                    <motion.span
                      className="ml-auto"
                      animate={{
                        rotate: openMenus[item.name] ? 180 : 0,
                        color: openMenus[item.name] ? "#2563eb" : "#64748b",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {openMenus[item.name] ? (
                        <FiChevronUp size={18} />
                      ) : (
                        <FiChevronDown size={18} />
                      )}
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openMenus[item.name] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-8 flex flex-col gap-1 overflow-hidden"
                      >
                        {item.submenu.map((sub) => (
                          <NavLink
                            key={sub.name}
                            to={sub.to}
                            end
                            className={({ isActive }) =>
                              `flex items-center mt-1 gap-2 px-2 py-1 hover:ps-4 transition-all text-sm rounded hover:bg-blue-100 text-gray-600 ${
                                isActive ? "bg-blue-100 font-semibold" : ""
                              }`
                            }
                          >
                            <span>{sub.icon}</span>
                            {sub.name}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium ${
                      isActive ? "bg-blue-100 font-semibold" : ""
                    }`
                  }
                  end
                >
                  <span>{item.icon}</span>
                  {item.name}
                </NavLink>
              )}
            </div>
          ))}
        </nav>
      </aside>
      {/* Mobile Topbar & Hamburger */}
      <div className="md:hidden fixed top-0 left-0 w-full z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 shadow-sm">
        <h2 className="text-xl font-bold text-blue-600">Yönetim Paneli</h2>
        <button
          className="p-2 rounded hover:bg-blue-100 text-blue-600 focus:outline-none"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Menüyü Aç"
        >
          <FiMenu size={24} />
        </button>
      </div>
      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 flex md:hidden"
          >
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-30"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Sidebar */}
            <div className="relative w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-blue-600">
                  Yönetim Paneli
                </h2>
                <button
                  className="p-2 rounded hover:bg-blue-100 text-blue-600 focus:outline-none"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-label="Menüyü Kapat"
                >
                  <FiX size={24} />
                </button>
              </div>
              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <div key={item.name}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className="flex items-center w-full gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium focus:outline-none group"
                        >
                          <span>{item.icon}</span>
                          {item.name}
                          <motion.span
                            className="ml-auto"
                            animate={{
                              rotate: openMenus[item.name] ? 180 : 0,
                              color: openMenus[item.name]
                                ? "#2563eb"
                                : "#64748b",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          >
                            {openMenus[item.name] ? (
                              <FiChevronUp size={18} />
                            ) : (
                              <FiChevronDown size={18} />
                            )}
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {openMenus[item.name] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="pl-8 flex flex-col gap-1 overflow-hidden"
                            >
                              {item.submenu.map((sub) => (
                                <NavLink
                                  key={sub.name}
                                  to={sub.to}
                                  className={({ isActive }) =>
                                    `flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-100 text-gray-600 ${
                                      isActive
                                        ? "bg-blue-100 font-semibold"
                                        : ""
                                    }`
                                  }
                                  onClick={() => setMobileSidebarOpen(false)}
                                >
                                  <span>{sub.icon}</span>
                                  {sub.name}
                                </NavLink>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-gray-700 font-medium ${
                            isActive ? "bg-blue-100 font-semibold" : ""
                          }`
                        }
                        end
                        onClick={() => setMobileSidebarOpen(false)}
                      >
                        <span>{item.icon}</span>
                        {item.name}
                      </NavLink>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
