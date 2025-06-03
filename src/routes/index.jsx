import { createBrowserRouter } from "react-router-dom";
import UsersLayout from "../pages/users/UsersLayout";
import AdminLayout from "../pages/admin/AdminLayout";
import Home from "../pages/users/Home";
import Dashboard from "../pages/admin/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UsersLayout />,
    children: [{ index: true, element: <Home /> }],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [{ path: "", element: <Dashboard /> }],
  },
]);

export default router;
