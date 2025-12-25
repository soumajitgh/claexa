import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  OptionResponse,
  questionPaperService,
  QuestionResponse,
  SubQuestionResponse,
} from "@/api";
import { ArrowLeft, FileText, ListChecks } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkdownViewer } from "@/components/markdown/MarkdownViewer";
import { QuestionImageViewer } from "@/features/question-paper-studio/ImageViewer";
import { ExportButton } from "@/features/question-paper-studio/PaperExportButton";
import { QuestionPaperProvider } from "@/context/question-paper";

// Utilities --------------------------------------------------
const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

// Skeletons --------------------------------------------------
const QuestionSkeleton: React.FC = () => (
  <Card className="p-5 space-y-3 animate-pulse border-muted/50">
    <div className="flex gap-3">
      <Skeleton className="h-6 w-6 rounded-md shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  </Card>
);

// Question Item Component (No card, continuous list) --------------------------------------------------
interface QuestionItemProps {
  question: QuestionResponse;
  index: number;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
  question: q,
  index: idx,
}) => {
  return (
    <li className="space-y-4 mb-6">
      {/* Question header */}
      <div className="flex flex-col items-start gap-2">
        {/* Question number */}
        <div className="flex flex-row items-center justify-between bg-accent w-full px-6 py-4 rounded-md">
          <p className="text-sm font-medium text-accent-foreground">
            Question {idx + 1}
          </p>

          <Badge
            variant="default"
            className="h-5 px-2 text-[10px] font-semibold rounded-full"
          >
            {plural(q.marks, "mark", "marks")}
          </Badge>
        </div>

        {/* Question text and marks */}
        <div className="px-4 text-sm leading-relaxed break-words">
          <MarkdownViewer source={q.text} />
        </div>
      </div>

      {/* Question Images */}
      {q.imageMediaIds && q.imageMediaIds.length > 0 && (
        <ScrollArea dir={"ltr"} className="px-4 space-y-3">
          {q.imageMediaIds.map((mediaId, index) => (
            <QuestionImageViewer
              key={mediaId}
              mediaId={mediaId}
              alt={`Question image ${index + 1}`}
              className="w-full"
              previewClassName="rounded-lg shadow-sm border"
              fallbackText="Question image could not be loaded"
            />
          ))}
        </ScrollArea>
      )}

      {/* Options */}
      {q.options.length > 0 && (
        <ul className="space-y-2 px-4" aria-label="Options">
          {q.options.map((o: OptionResponse, oIdx: number) => (
            <li key={o.id} className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border-2 text-[11px] font-bold bg-accent/50 border-accent-foreground/20 shrink-0">
                {String.fromCharCode(65 + oIdx)}
              </span>
              <div className="text-sm leading-relaxed break-words flex-1 pt-0.5">
                <MarkdownViewer source={o.text} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Sub-questions */}
      {q.subQuestions.length > 0 && (
        <div className="ml-10 space-y-3">
          <ol className="space-y-3" aria-label="Sub-questions" start={1}>
            {q.subQuestions.map((sq: SubQuestionResponse, subIdx: number) => (
              <li key={sq.id} className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-md bg-primary/15 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                    <span className="text-[10px] font-bold text-primary">
                      {String.fromCharCode(97 + subIdx)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      <MarkdownViewer source={sq.text} />
                    </div>
                    <Badge
                      variant="outline"
                      className="h-5 px-2 text-[10px] rounded-full"
                    >
                      {plural(sq.marks, "mark", "marks")}
                    </Badge>
                  </div>
                </div>
                {sq.options.length > 0 && (
                  <ul
                    className="space-y-1.5 ml-8"
                    aria-label="Sub-question options"
                  >
                    {sq.options.map((o: OptionResponse, subOIdx: number) => (
                      <li key={o.id} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-bold bg-accent/40 shrink-0">
                          {String.fromCharCode(65 + subOIdx)}
                        </span>
                        <div className="text-xs leading-relaxed break-words flex-1 pt-0.5">
                          <MarkdownViewer source={o.text} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
};

// Main View --------------------------------------------------
export const MobileQuestionPaperView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["question-paper", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Missing id");
      const res = await questionPaperService.getById(id);
      return res.data;
    },
  });

  const paper = data;

  // Show loading skeleton for entire page on initial load
  if (isLoading && !paper) {
    return (
      <div
        className="min-h-screen flex flex-col bg-background text-foreground"
        role="main"
      >
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 px-5 pt-6 pb-4 bg-background/95 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
          <Skeleton className="h-4 w-full ml-12" />
        </header>

        {/* Body Skeleton */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-6 space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <QuestionSkeleton key={i} />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <QuestionPaperProvider
      value={{
        questionPaper: paper ?? null,
        isLoading,
        isError,
        error: null,
      }}
    >
      <div
        className="min-h-screen flex flex-col bg-background text-foreground"
        role="main"
      >
        {/* Header */}
        <header className="sticky top-0 z-40 px-2 py-4 flex items-center gap-1 shadow-xl bg-background/95 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft />
          </Button>

          <p className="text-sm truncate flex-1 ">
            {paper?.name || "Question Paper"}
          </p>

          <ExportButton />
        </header>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="w-full space-y-6">
            {/* Error state */}
            {isError && (
              <Card className="p-8 space-y-4 text-center border-destructive/20 bg-destructive/5">
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                  <ListChecks className="h-6 w-6 text-destructive" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold">Failed to load paper</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Check your connection and try again.
                  </p>
                </div>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="mx-auto"
                >
                  Retry
                </Button>
              </Card>
            )}

            {/* Empty state */}
            {paper && paper.questions.length === 0 && (
              <Card className="p-10 flex flex-col items-center text-center gap-4 border-dashed">
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center bg-primary/10 text-primary ring-4 ring-primary/5">
                  <FileText className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <p className="font-bold text-base">No questions yet</p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                    This paper doesn't have any questions. Add questions to get
                    started.
                  </p>
                </div>
              </Card>
            )}

            {/* Questions list - Continuous, no individual cards */}
            {paper && paper.questions.length > 0 && (
              <ol className="space-y-0" start={1} aria-label="Questions list">
                {paper.questions.map((q, idx) => (
                  <QuestionItem key={q.id} question={q} index={idx} />
                ))}
              </ol>
            )}
          </div>
        </ScrollArea>
      </div>
    </QuestionPaperProvider>
  );
};

export default MobileQuestionPaperView;
