import { Outlet, NavLink } from "react-router-dom";

const UsersLayout = () => {
  return (
    <div>
      <header className="bg-blue-600 text-white p-4">
        <nav className="flex gap-4">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
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
