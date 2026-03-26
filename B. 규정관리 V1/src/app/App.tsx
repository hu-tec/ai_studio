import { RouterProvider } from "react-router";
import { router } from "./routes";
import { RulesProvider } from "./components/RulesContext";

export default function App() {
  return (
    <RulesProvider>
      <RouterProvider router={router} />
    </RulesProvider>
  );
}
