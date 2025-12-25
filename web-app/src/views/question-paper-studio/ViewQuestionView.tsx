import { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router";
import { useQuestionPaper } from "@/context/question-paper";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MarkdownViewer } from "@/components/markdown/MarkdownViewer";
import { Edit, CirclePlus } from "lucide-react";
import { QuestionDeleteButton } from "@/features/question-paper-studio/QuestionDeleteButton";
import { EditQuestionSheet } from "@/features/question-paper-studio/EditQuestionSheet";
import { QuestionImageViewer } from "@/features/question-paper-studio/ImageViewer";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { QuestionOptionResponseDto, SubQuestionResponseDto } from "@/api";

// Question Option Component
const QuestionOption = ({
  option,
  index,
}: {
  option: QuestionOptionResponseDto;
  index: number;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
      {String.fromCharCode(65 + index)}
    </span>
    <div className="flex-1">
      <MarkdownViewer source={option.text || ""} />
    </div>
  </div>
);

// Sub-Question Accordion Item Component
const SubQuestionItem = ({
  subQuestion,
  index,
}: {
  subQuestion: SubQuestionResponseDto;
  index: number;
}) => (
  <AccordionItem value={`subquestion-${index}`}>
    <AccordionTrigger className="bg-accent/40 hover:no-underline px-4">
      <div className="flex items-center gap-3 w-full">
        <span className="text-left flex-1">
          Sub Question {String.fromCharCode(65 + index)}
        </span>
        <Badge variant="secondary">{subQuestion.marks} marks</Badge>
      </div>
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-4 pt-4 px-5">
        {/* Sub-question text */}
        <div className="prose max-w-none">
          <MarkdownViewer
            source={subQuestion.text || "Failed to load sub-question"}
            style={{ fontSize: "1rem", lineHeight: "1.5rem" }}
          />
        </div>

        {/* Sub-question options */}
        {subQuestion.options && subQuestion.options.length > 0 && (
          <div className="space-y-2">
            {subQuestion.options.map((option, optionIndex) => (
              <QuestionOption
                key={option.id}
                option={option}
                index={optionIndex}
              />
            ))}
          </div>
        )}
      </div>
    </AccordionContent>
  </AccordionItem>
);

export default function ViewQuestionView() {
  const navigate = useNavigate();
  const { id: questionPaperId, questionId } = useParams<{
    id: string;
    questionId: string;
  }>();
  const { questionPaper, isLoading, isError } = useQuestionPaper();
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Find the main question
  const question = questionPaper?.questions.find((q) => q.id === questionId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">Loading...</div>
    );
  }

  if (isError || !questionPaper || !question) {
    return <Navigate to="../not-found" replace />;
  }

  const questionNumber = questionPaper.questions.indexOf(question) + 1;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 sticky top-0 bg-background z-10 shadow">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground text-sm">
            Question {questionNumber}
          </p>
          <Badge>{question.marks} marks</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditSheetOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <QuestionDeleteButton
            questionPaperId={questionPaperId!}
            questionId={questionId!}
          />
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-8 py-8 px-4">
          <div className="container mx-auto max-w-4xl prose">
            <MarkdownViewer
              source={question.text || "Failed to load question"}
              style={{ fontSize: "1.1rem", lineHeight: "1.6rem" }}
            />
          </div>

          {/* Question Images */}
          {question.imageMediaIds && question.imageMediaIds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 container mx-auto max-w-4xl">
              {question.imageMediaIds.map((mediaId, index) => (
                <QuestionImageViewer
                  key={mediaId}
                  mediaId={mediaId}
                  alt={`Question image ${index + 1}`}
                  className="w-full"
                  previewClassName="rounded-lg shadow-sm border"
                  fallbackText="Question image could not be loaded"
                />
              ))}
            </div>
          )}

          {/* Conditional rendering: Sub-questions OR Options */}
          {question.subQuestions && question.subQuestions.length > 0 ? (
            // Render Sub-questions Accordion
            <div className="container mx-auto max-w-4xl mb-8">
              <Accordion type="multiple" className="w-full">
                {question.subQuestions.map((subQuestion, index) => (
                  <SubQuestionItem
                    key={subQuestion.id}
                    subQuestion={subQuestion}
                    index={index}
                  />
                ))}
              </Accordion>
            </div>
          ) : question.options && question.options.length > 0 ? (
            // Render Options if no sub-questions
            <div className="container mx-auto max-w-4xl mb-8">
              <h3 className="text-lg font-semibold mb-4">Options</h3>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <QuestionOption
                    key={option.id || index}
                    option={option}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ) : (
            // No options or sub-questions available
            <div className="container mx-auto max-w-4xl mb-8">
              <div className="border-4 border-dashed border-muted-foreground/20 rounded-lg py-8 flex flex-col items-center justify-center gap-6">
                <p className="text-muted-foreground">No options available</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(`/question-paper/studio/${questionPaperId}`)
                  }
                >
                  <CirclePlus className="h-4 w-4 mr-2" />
                  Add Options
                </Button>
              </div>
            </div>
          )}

          {/* Edit Question Sheet */}
          <EditQuestionSheet
            open={editSheetOpen}
            onOpenChange={setEditSheetOpen}
            questionPaperId={questionPaperId!}
            questionId={questionId!}
            onSuccess={() => {
              // Optional: Add any success handling here
            }}
          />
        </div>
      </div>
    </div>
  );
}
