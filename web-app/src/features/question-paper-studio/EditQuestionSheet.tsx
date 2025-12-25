import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { api } from "@/api";
import { useQuestionPaper } from "@/context/question-paper";

interface EditQuestionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionPaperId: string;
  questionId: string;
  onSuccess?: () => void;
}

export function EditQuestionSheet({
  open,
  onOpenChange,
  questionPaperId,
  questionId,
  onSuccess,
}: EditQuestionSheetProps) {
  const queryClient = useQueryClient();
  const { questionPaper } = useQuestionPaper();
  const [text, setText] = useState("");
  const [marks, setMarks] = useState(1);

  // Find the current question
  const currentQuestion = questionPaper?.questions.find(
    (q) => q.id === questionId
  );

  // Initialize form with current question data
  useEffect(() => {
    if (currentQuestion && open) {
      setText(currentQuestion.text || "");
      setMarks(currentQuestion.marks || 1);
    }
  }, [currentQuestion, open]);

  const editQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!questionPaperId || !questionId) {
        throw new Error("Missing IDs");
      }

      return api.questionPapers.updateQuestionCmd(questionPaperId, {
        questionId,
        text: text || "Untitled question",
        marks: marks || 1,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["questionPaper", questionPaperId],
      });
      toast.success("Question updated successfully!");
      onSuccess?.();
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update question");
    },
  });

  const handleClose = () => {
    // Reset form to original values
    if (currentQuestion) {
      setText(currentQuestion.text || "");
      setMarks(currentQuestion.marks || 1);
    }
    onOpenChange(false);
  };

  const handleSubmit = () => {
    editQuestionMutation.mutate();
  };

  const isFormValid = text.trim().length > 0 && marks > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Question</SheetTitle>
          <SheetDescription>
            Update the text and marks for this question.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <MarkdownEditor
              value={text}
              onChange={(value) => setText(value ?? "")}
              placeholder="Enter question text in markdown"
              height={300}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-marks">Marks</Label>
            <Input
              id="question-marks"
              type="number"
              className="w-full"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        <SheetFooter>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={editQuestionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={editQuestionMutation.isPending || !isFormValid}
            >
              {editQuestionMutation.isPending && (
                <Loader className="size-4 animate-spin mr-2" />
              )}
              Update Question
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
