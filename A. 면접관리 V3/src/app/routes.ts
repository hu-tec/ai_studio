import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { InterviewForm } from "./components/InterviewForm";
import { Dashboard } from "./components/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: InterviewForm },
      { path: "dashboard", Component: Dashboard },
    ],
  },
]);
