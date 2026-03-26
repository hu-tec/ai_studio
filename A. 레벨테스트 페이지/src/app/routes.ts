import { createBrowserRouter } from "react-router";
import { ExamLayout } from "./components/exam-layout";
import { ExamIntro } from "./components/exam-intro";
import { ReadingSection } from "./components/reading-section";
import { WritingSection } from "./components/writing-section";
import { ResultPage } from "./components/result-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: ExamLayout,
    children: [
      { index: true, Component: ExamIntro },
      { path: "section1", Component: ReadingSection },
      { path: "section2", Component: WritingSection },
      { path: "result", Component: ResultPage },
    ],
  },
]);
