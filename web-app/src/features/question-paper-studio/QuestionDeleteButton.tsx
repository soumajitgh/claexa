import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { reactQueryClient } from "@/api/lib/reactQuery";
import { api } from "@/api";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionDeleteButtonProps {
  questionPaperId: string;
  questionId: string;
  onSuccess?: () => void;
}

export function QuestionDeleteButton({
  questionPaperId,
  questionId,
  onSuccess,
}: QuestionDeleteButtonProps) {
  const deleteMutation = useMutation({
    mutationFn: () => {
      return api.questionPapers.deleteQuestionCmd(questionPaperId, {
        questionId,
      });
    },
    onSuccess: () => {
      toast.success("Question deleted successfully!");
      onSuccess?.();
      reactQueryClient.invalidateQueries({
        queryKey: ["questionPaper", questionPaperId],
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });

  return (
    <Button
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        if (!deleteMutation.isPending) {
          deleteMutation.mutate();
        }
      }}
      disabled={deleteMutation.isPending}
    >
      <Trash2 className="" />
      {deleteMutation.isPending && "Deleting..."}
    </Button>
  );
}
