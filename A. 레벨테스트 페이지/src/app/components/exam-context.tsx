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
  const submit = () => setState((s) => ({ ...s, submitted: true }));
  const reset = () => setState(initialState);
  const startExam = () => setState((s) => ({ ...s, startTime: Date.now() }));

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
