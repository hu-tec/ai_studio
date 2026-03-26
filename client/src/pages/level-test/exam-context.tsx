import { createContext, useContext, useState, ReactNode } from "react";

interface ExamState {
  examType: string;
  name: string;
  program: string;
  date: string;
  answers: Record<number, string>;
  selectedTopic: number | null;
  essay: string;
  submitted: boolean;
  startTime: number | null;
  step: "intro" | "section1" | "section2" | "result";
}

interface ExamContextType {
  state: ExamState;
  setExamType: (type: string) => void;
  setName: (name: string) => void;
  setProgram: (program: string) => void;
  setDate: (date: string) => void;
  setAnswer: (questionId: number, answer: string) => void;
  setSelectedTopic: (topic: number) => void;
  setEssay: (essay: string) => void;
  submit: () => void;
  reset: () => void;
  startExam: () => void;
  navigate: (step: ExamState["step"]) => void;
}

const initialState: ExamState = {
  examType: "",
  name: "",
  program: "",
  date: new Date().toISOString().split("T")[0],
  answers: {},
  selectedTopic: null,
  essay: "",
  submitted: false,
  startTime: null,
  step: "intro",
};

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExamState>(initialState);

  const setExamType = (examType: string) => setState((s) => ({ ...s, examType }));
  const setName = (name: string) => setState((s) => ({ ...s, name }));
  const setProgram = (program: string) => setState((s) => ({ ...s, program }));
  const setDate = (date: string) => setState((s) => ({ ...s, date }));
  const setAnswer = (questionId: number, answer: string) =>
    setState((s) => ({ ...s, answers: { ...s.answers, [questionId]: answer } }));
  const setSelectedTopic = (topic: number) =>
    setState((s) => ({ ...s, selectedTopic: topic }));
  const setEssay = (essay: string) => setState((s) => ({ ...s, essay }));
  const submit = () => {
    setState((s) => {
      const submitted = { ...s, submitted: true };
      // Save to API (fire-and-forget)
      const testId = `test-${s.name}-${Date.now()}`;
      fetch('/api/level-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testId,
          data: {
            examType: s.examType,
            name: s.name,
            program: s.program,
            date: s.date,
            answers: s.answers,
            selectedTopic: s.selectedTopic,
            essay: s.essay,
            startTime: s.startTime,
            submittedAt: new Date().toISOString(),
          },
        }),
      }).catch(() => {});
      return submitted;
    });
  };
  const reset = () => setState(initialState);
  const startExam = () => setState((s) => ({ ...s, startTime: Date.now() }));
  const navigate = (step: ExamState["step"]) => setState((s) => ({ ...s, step }));

  return (
    <ExamContext.Provider
      value={{
        state,
        setExamType,
        setName,
        setProgram,
        setDate,
        setAnswer,
        setSelectedTopic,
        setEssay,
        submit,
        reset,
        startExam,
        navigate,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) throw new Error("useExam must be used within ExamProvider");
  return context;
}
