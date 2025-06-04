import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/users/Home";
import Dashboard from "../pages/admin/Dashboard";
import UsersLayout from "../layouts/UsersLayout";
import AdminLayout from "../layouts/AdminLayout";
import Schools from "../pages/admin/schools/Schools";
import AddSchool from "../pages/admin/schools/AddSchool";
import NotFound from "../pages/admin/not-found/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UsersLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "schools", element: <Schools /> },
      { path: "schools/add", element: <AddSchool /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
