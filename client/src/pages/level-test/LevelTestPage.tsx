import { ExamProvider, useExam } from "./exam-context";
import { ExamIntro } from "./exam-intro";
import { ReadingSection } from "./reading-section";
import { WritingSection } from "./writing-section";
import { ResultPage } from "./result-page";

function ExamRouter() {
  const { state } = useExam();

  switch (state.step) {
    case "section1":
      return <ReadingSection />;
    case "section2":
      return <WritingSection />;
    case "result":
      return <ResultPage />;
    default:
      return <ExamIntro />;
  }
}

function LevelTestPage() {
  return (
    <ExamProvider>
      <ExamRouter />
    </ExamProvider>
  );
}

export default LevelTestPage;
