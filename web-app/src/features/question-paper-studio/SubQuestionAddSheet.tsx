import { useState } from "react";
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

interface SubQuestionAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionPaperId: string;
  parentQuestionId: string | null;
  onSuccess?: () => void;
}

export function SubQuestionAddSheet({
  open,
  onOpenChange,
  questionPaperId,
  parentQuestionId,
  onSuccess,
}: SubQuestionAddSheetProps) {
  const queryClient = useQueryClient();
  const { questionPaper } = useQuestionPaper();
  const [text, setText] = useState("");
  const [marks, setMarks] = useState(1);

  const addSubMutation = useMutation({
    mutationFn: async () => {
      if (!questionPaperId || !parentQuestionId) {
        throw new Error("Missing IDs");
      }

      // Get the current question to determine the index
      const question = questionPaper?.questions.find(
        (q) => q.id === parentQuestionId
      );
      const index = question?.subQuestions?.length || 0;

      return api.questionPapers.createSubQuestionCmd(questionPaperId, {
        questionId: parentQuestionId,
        text: text || "New sub-question",
        marks: marks || 1,
        index,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["questionPaper", questionPaperId],
      });
      toast.success("Sub-question added");
      onSuccess?.();
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add sub-question");
    },
  });

  const handleClose = () => {
    setText("");
    setMarks(1);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    addSubMutation.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Sub-question</SheetTitle>
          <SheetDescription>
            Provide the text and marks for the new sub-question.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sub-question-text">Text</Label>
            <MarkdownEditor
              value={text}
              onChange={(value) => setText(value ?? "")}
              placeholder="Enter sub-question markdown"
              height={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-question-marks">Marks</Label>
            <Input
              id="sub-question-marks"
              type="number"
              min={1}
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value) || 1)}
              className="w-24"
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={addSubMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={addSubMutation.isPending}
          >
            {addSubMutation.isPending && (
              <Loader className="size-4 animate-spin mr-2" />
            )}
            Add Sub-question
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
