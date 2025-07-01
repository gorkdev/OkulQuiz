import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const UsersLayout = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <div>
      <header className="bg-blue-600 text-white p-4">
        <nav className="flex gap-4">
          <a
            href="/"
            className={`hover:text-blue-200 transition-colors ${
              currentPath === "/" ? "font-semibold text-blue-200" : ""
            }`}
          >
            Home
          </a>
          <a
            href="/about"
            className={`hover:text-blue-200 transition-colors ${
              currentPath === "/about" ? "font-semibold text-blue-200" : ""
            }`}
          >
            About
          </a>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
      <footer className="bg-gray-100 text-center p-4 mt-12">
        © 2025 MySite
      </footer>
    </div>
  );
};

export default UsersLayout;
