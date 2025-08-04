import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/users/Login";
import Home from "../pages/users/Home";
import Dashboard from "../pages/admin/Dashboard";
import UsersLayout from "../layouts/UsersLayout";
import AdminLayout from "../layouts/AdminLayout";
import Schools from "../pages/admin/schools/Schools";
import AddSchool from "../pages/admin/schools/AddSchool";
import NotFound from "../pages/admin/not-found/NotFound";
import Credits from "../pages/admin/credits/Credits";
import AddCredi from "../pages/admin/credits/AddCredi";
import Logs from "../pages/admin/logs/Logs";
import AddNewQuestion from "../pages/admin/questions/AddNewQuestion";
import AddNewCategory from "../pages/admin/categories/AddNewCategory";
import Categories from "../pages/admin/categories/Categories";
import Questions from "../pages/admin/questions/Questions";
import CreateNewQuiz from "../pages/admin/quiz/CreateNewQuiz";
import QuizList from "../pages/users/quiz/QuizList";
import QuizSolve from "../pages/users/quiz/QuizSolve";
import Settings from "../pages/admin/settings/Settings";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  {
    path: "/home",
    element: <UsersLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "quiz", element: <QuizList /> },
      { path: "quiz/:quizId", element: <QuizSolve /> },
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
      { path: "credits", element: <Credits /> },
      { path: "credits/add", element: <AddCredi /> },
      { path: "quiz", element: <AddCredi /> },
      { path: "quiz/add", element: <CreateNewQuiz /> },
      { path: "categories", element: <Categories /> },
      { path: "categories/add", element: <AddNewCategory /> },
      { path: "questions", element: <Questions /> },
      { path: "questions/add", element: <AddNewQuestion /> },
      { path: "logs", element: <Logs /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
