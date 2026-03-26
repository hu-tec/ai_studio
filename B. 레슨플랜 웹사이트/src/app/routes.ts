import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ListPage } from "./components/ListPage";
import { WritePage } from "./components/WritePage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ListPage },
      { path: "write", Component: WritePage },
      { path: "edit/:id", Component: WritePage },
    ],
  },
]);
