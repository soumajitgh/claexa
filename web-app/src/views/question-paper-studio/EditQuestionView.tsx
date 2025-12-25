import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator.tsx";
import { Loader } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";

const formSchema = z.object({
  text: z.string().min(1, { message: "Question text is required." }),
  marks: z.coerce.number().min(1, { message: "Marks must be at least 1." }),
});

export default function EditQuestionView() {
  const { id: questionPaperId, questionId } = useParams<{
    id: string;
    questionId: string;
  }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: questionPaper,
    isLoading: isLoadingQuestionPaper,
    error: questionPaperError,
  } = useQuery({
    queryKey: ["questionPaper", questionPaperId],
    queryFn: () => {
      if (!questionPaperId) throw new Error("Question paper ID is missing");
      return api.questionPapers.getById(questionPaperId);
    },
    enabled: !!questionPaperId,
  });

  const currentQuestion = useMemo(() => {
    return questionPaper?.data?.questions.find((q) => q.id === questionId);
  }, [questionPaper, questionId]);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      marks: 1,
    },
  });

  useEffect(() => {
    if (currentQuestion) {
      reset({
        text: currentQuestion.text,
        marks: currentQuestion.marks,
      });
    }
  }, [currentQuestion, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      if (!questionPaperId || !questionId) {
        throw new Error("Missing IDs for update");
      }
      return api.questionPapers.updateQuestionCmd(questionPaperId, {
        questionId,
        text: values.text,
        marks: values.marks,
      });
    },
    onSuccess: async () => {
      toast.success("Question updated successfully!");
      await queryClient.invalidateQueries({
        queryKey: ["questionPaper", questionPaperId],
      });
      navigate(`/question-paper/studio/${questionPaperId}/${questionId}`);
    },
    onError: () => {
      toast.error("Failed to update question.");
    },
  });

  // Delete question mutation (command-based API)
  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!questionPaperId || !questionId)
        throw new Error("Missing IDs for delete");
      return api.questionPapers.deleteQuestionCmd(questionPaperId, {
        questionId,
      });
    },
    onSuccess: async () => {
      // Determine navigation target BEFORE invalidation
      const qs = questionPaper?.data?.questions || [];
      const idx = qs.findIndex((q) => q.id === questionId);
      let target: string | null = null;
      if (qs.length > 1) {
        if (idx < qs.length - 1) target = qs[idx + 1].id;
        else if (idx > 0) target = qs[idx - 1].id;
      }
      await queryClient.invalidateQueries({
        queryKey: ["questionPaper", questionPaperId],
      });
      toast.success("Question deleted successfully!");
      if (target) {
        navigate(`/question-paper/studio/${questionPaperId}/${target}`);
      } else {
        navigate(`/question-paper/studio/${questionPaperId}`);
      }
    },
    onError: (e: Error) =>
      toast.error(`Failed to delete question: ${e.message}`),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateMutation.mutate(values);
  }

  if (isLoadingQuestionPaper) {
    return (
      <div className="container mx-auto max-w-3xl min-w-xl p-4 flex justify-center items-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (questionPaperError || !currentQuestion) {
    return (
      <div className="container mx-auto max-w-3xl min-w-xl p-4">
        <h1 className="text-2xl font-bold mt-6 text-destructive">
          {questionPaperError
            ? "Error loading question paper."
            : "Question not found."}
        </h1>
        <p>{questionPaperError?.message}</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl min-w-xl">
      <div className="flex justify-between items-center mt-6">
        <h1 className="text-2xl font-bold">Edit Question</h1>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            type="button"
            onClick={() => {
              if (!deleteMutation.isPending) deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/question-paper/studio/${questionPaperId}/${questionId}`
              )
            }
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending || isSubmitting}
          >
            {updateMutation.isPending || isSubmitting ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {updateMutation.isPending || isSubmitting
              ? "Saving..."
              : "Save Changes"}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <div className="space-y-2 col-span-2">
          <Label htmlFor="text">Question</Label>
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <MarkdownEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter the question text as markdown"
              />
            )}
          />
          {errors.text && (
            <p className="text-sm font-medium text-destructive">
              {errors.text.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="marks">Marks</Label>
          <Controller
            name="marks"
            control={control}
            render={({ field }) => (
              <Input
                id="marks"
                type="number"
                placeholder="Enter marks"
                {...field}
              />
            )}
          />
          {errors.marks && (
            <p className="text-sm font-medium text-destructive">
              {errors.marks.message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
