import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type QuestionPaperResponse } from "@/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Pen } from "lucide-react";
import React, { useState } from "react";

interface RenameQuestionPaperDialogProps {
  questionPaper: QuestionPaperResponse;
  triggerText?: string;
  asChild?: boolean;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const renameSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type RenameFormValues = z.infer<typeof renameSchema>;

export function RenameQuestionPaperDialog({
  questionPaper,
  triggerText = "Rename",
  asChild = false,
  children,
  open,
  onOpenChange,
}: RenameQuestionPaperDialogProps) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
  });

  React.useEffect(() => {
    if (isOpen && questionPaper) {
      reset({
        title: questionPaper.name,
        description: questionPaper.description || "",
      });
    }
  }, [isOpen, questionPaper, reset]);

  const mutation = useMutation({
    mutationFn: (data: RenameFormValues) =>
      api.questionPapers.updateQuestionPaperMetadata(questionPaper.id, {
        name: data.title,
        description: data.description,
      }),
    onSuccess: async () => {
      toast.success("Question paper renamed successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["questionPaper", questionPaper.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["questionPapers"] });
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to rename question paper: " + error.message);
    },
  });

  const onSubmit = (data: RenameFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {open === undefined && (
        <DialogTrigger asChild={asChild}>
          {asChild && children ? (
            children
          ) : (
            <Button variant="outline">
              <Pen className="mr-2 h-4 w-4" />
              {triggerText}
            </Button>
          )}
        </DialogTrigger>
      )}
      {isOpen && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Question Paper</DialogTitle>
            <DialogDescription>
              Update the title and description of your question paper. Click
              save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 py-4 w-full"
          >
            <div className="grid grid-cols-4 items-center gap-4">
              <Input id="title" {...register("title")} className="col-span-4" />
              {errors.title && (
                <p className="col-span-4 text-red-500 text-sm text-right">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Textarea
                id="description"
                {...register("description")}
                className="col-span-4"
                placeholder="Optional: Provide a brief description."
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
              >
                {isSubmitting || mutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
