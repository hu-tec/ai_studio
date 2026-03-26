import { Outlet } from "react-router";
import { ExamProvider } from "./exam-context";

export function ExamLayout() {
  return (
    <ExamProvider>
      <Outlet />
    </ExamProvider>
  );
}
