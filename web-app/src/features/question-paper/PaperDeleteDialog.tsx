import { toast } from "sonner";
import { api } from "@/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";

interface DeleteQuestionPaperDialogProps {
  questionPaperId: string;
}

export function DeleteQuestionPaperDialog({
  questionPaperId,
}: DeleteQuestionPaperDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api.questionPapers.delete(questionPaperId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Question paper deleted successfully!");
        setIsConfirmDialogOpen(false); // ensure dialog closes
        queryClient.invalidateQueries({ queryKey: ["questionPapers"] });
        navigate("/", { replace: true });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete question paper: ${error.message}`);
      setIsConfirmDialogOpen(false);
    },
  });

  const handleDelete = () => {
    if (!deleteMutation.isPending) {
      deleteMutation.mutate();
    }
  };

  return (
    <>
      <Button
        variant={"ghost"}
        className={
          "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        }
        onClick={(e) => {
          e.preventDefault();
          setIsConfirmDialogOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question Paper</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this question paper? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
