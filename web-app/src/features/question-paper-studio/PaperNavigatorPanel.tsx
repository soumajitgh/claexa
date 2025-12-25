import { useNavigate, useParams } from "react-router";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import type { QuestionResponseDto } from "@/api";
import { useQuestionPaper } from "@/context/question-paper";

// Utility functions
const cleanQuestionText = (text: string): string => {
  return text.replace(/[#*_~`]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
};

const getTrimmedText = (text: string, maxLength: number): string => {
  const cleaned = cleanQuestionText(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "(empty)";
  return cleaned.length > maxLength
    ? cleaned.slice(0, maxLength - 1).trimEnd() + "…"
    : cleaned;
};

export function QuestionPaperNavigatorPanel() {
  const { questionPaper, isLoading } = useQuestionPaper();
  const navigate = useNavigate();
  const params = useParams();

  // URL parameters
  const currentQuestionId = params.questionId;
  const questionPaperId = params.id as string | undefined;

  // UI State
  const [focusedIconId, setFocusedIconId] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Computed values
  const focusOrder = useMemo(() => {
    const mainIds = questionPaper?.questions.map((q) => `main:${q.id}`) || [];
    return [...mainIds, "main:add"];
  }, [questionPaper]);

  // Initialize focus on first question
  useEffect(() => {
    if (!focusedIconId && focusOrder.length > 0) {
      setFocusedIconId(focusOrder[0]);
    }
  }, [focusedIconId, focusOrder]);

  // Auto-focus DOM element
  useEffect(() => {
    if (focusedIconId) {
      const element = iconRefs.current[focusedIconId];
      element?.focus();
    }
  }, [focusedIconId]);

  // Helper functions
  const getQuestionPreview = (text: string) => getTrimmedText(text, 40);

  // Loading states
  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading questions…
      </div>
    );
  }

  if (!questionPaper) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        No question paper loaded.
      </div>
    );
  }

  // Render helper for question grid
  const renderQuestionButton = (
    question: QuestionResponseDto,
    globalIndex: number
  ) => {
    const id = `main:${question.id}`;
    const isFocused = focusedIconId === id;
    const isActive = currentQuestionId === question.id;

    return (
      <button
        key={question.id}
        ref={(el) => {
          iconRefs.current[id] = el;
        }}
        id={id}
        type="button"
        tabIndex={isFocused ? 0 : -1}
        aria-label={`Question ${globalIndex + 1}. ${getQuestionPreview(
          question.text
        )}`}
        className={`relative flex flex-col items-center justify-center h-12 rounded-md border text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
          isActive
            ? "bg-primary border-primary text-primary-foreground shadow-sm"
            : "hover:border-primary/50"
        } ${isFocused && !isActive ? "border-primary" : ""}`}
        style={{ width: "100%" }}
        onClick={() => {
          setFocusedIconId(id);
          navigate(`/question-paper/studio/${questionPaperId}/${question.id}`);
        }}
      >
        <span className="text-sm font-semibold">{globalIndex + 1}</span>
        {question.subQuestions && question.subQuestions.length > 0 && (
          <span
            className={`absolute top-0.5 right-0.5 text-[9px] font-semibold ${
              isActive
                ? "text-primary-foreground"
                : "rounded-full bg-muted px-1 py-0.5 leading-none"
            }`}
          >
            {question.subQuestions.length}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full text-xs min-h-0"
    >
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-1">
          <div aria-label="Questions" role="group" className="space-y-1">
            {(() => {
              const questions = questionPaper.questions;
              const rows: React.ReactNode[] = [];

              // Process questions in rows of 4
              for (let i = 0; i < questions.length; i += 4) {
                const slice = questions.slice(i, i + 4);
                const rowIndex = i / 4;

                rows.push(
                  <div
                    key={`row-${rowIndex}`}
                    className="grid grid-cols-4 gap-1"
                  >
                    {slice.map((q, idx) => renderQuestionButton(q, i + idx))}

                    {/* Add button in partial row */}
                    {i + 4 >= questions.length &&
                      questions.length % 4 !== 0 && (
                        <button
                          key="add-main"
                          ref={(el) => {
                            iconRefs.current["main:add"] = el;
                          }}
                          id="main:add"
                          type="button"
                          tabIndex={focusedIconId === "main:add" ? 0 : -1}
                          aria-label="Add question"
                          className={`flex flex-col items-center justify-center h-12 rounded-md border border-dashed text-[11px] text-muted-foreground hover:text-primary hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                            focusedIconId === "main:add" ? "border-primary" : ""
                          }`}
                          onClick={() =>
                            navigate(
                              `/question-paper/studio/${questionPaperId}/add-question`
                            )
                          }
                        >
                          <Plus className="size-4" />
                        </button>
                      )}
                  </div>
                );
              }

              // Add button on new row if needed
              if (questions.length % 4 === 0) {
                rows.push(
                  <div key="row-add" className="grid grid-cols-4 gap-1">
                    <button
                      key="add-main"
                      ref={(el) => {
                        iconRefs.current["main:add"] = el;
                      }}
                      id="main:add"
                      type="button"
                      tabIndex={focusedIconId === "main:add" ? 0 : -1}
                      aria-label="Add question"
                      className={`flex flex-col items-center justify-center h-12 rounded-md border border-dashed text-[11px] text-muted-foreground hover:text-primary hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        focusedIconId === "main:add" ? "border-primary" : ""
                      }`}
                      onClick={() =>
                        navigate(
                          `/question-paper/studio/${questionPaperId}/add-question`
                        )
                      }
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                );
              }

              return rows;
            })()}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
