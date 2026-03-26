import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { CompanyPage } from "./pages/CompanyPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { RanksPage } from "./pages/RanksPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "company", Component: CompanyPage },
      { path: "departments", Component: DepartmentsPage },
      { path: "ranks", Component: RanksPage },
    ],
  },
]);
