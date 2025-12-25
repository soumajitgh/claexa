import { createContext, ReactNode, useContext } from "react";
import { QuestionPaperResponse } from "@/api";

interface QuestionPaperContextType {
  questionPaper: QuestionPaperResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const QuestionPaperContext = createContext<
  QuestionPaperContextType | undefined
>(undefined);

interface QuestionPaperProviderProps {
  children: ReactNode;
  value: QuestionPaperContextType;
}

export function QuestionPaperProvider({
  children,
  value,
}: QuestionPaperProviderProps) {
  return (
    <QuestionPaperContext.Provider value={value}>
      {children}
    </QuestionPaperContext.Provider>
  );
}

export function useQuestionPaper() {
  const context = useContext(QuestionPaperContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionPaper must be used within a QuestionPaperProvider"
    );
  }
  return context;
}
