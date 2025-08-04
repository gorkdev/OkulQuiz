import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

const UsersLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white flex flex-col">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          {/* Sade logo veya küçük maskot */}
          <span className="text-2xl font-bold text-blue-500 tracking-tight select-none">
            MinikUP
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <a
            href="/home"
            className="text-gray-700 font-medium px-2 py-1 rounded transition-colors hover:bg-blue-50 hover:text-blue-600"
          >
            Ana Sayfa
          </a>
          <a
            href="/home/quiz"
            className="text-gray-700 font-medium px-2 py-1 rounded transition-colors hover:bg-green-50 hover:text-green-600"
          >
            Quiz
          </a>
          <a
            href="/profile"
            className="text-gray-700 font-medium px-2 py-1 rounded transition-colors hover:bg-purple-50 hover:text-purple-600"
          >
            Profil
          </a>
        </nav>
        <button
          onClick={() => (window.location.href = "/")}
          className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded transition-colors font-medium shadow-sm"
        >
          Çıkış
        </button>
      </motion.header>
      {/* İçerik */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
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
