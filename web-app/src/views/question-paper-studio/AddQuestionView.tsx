import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/api";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator.tsx";
import { Loader } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";

const formSchema = z.object({
  text: z.string().min(1, { message: "Question text is required." }),
  marks: z.coerce.number().min(1, { message: "Marks must be at least 1." }),
});

export default function AddQuestionView() {
  const params = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: "", marks: 1 },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!params.id) {
      toast.error("Question paper ID is missing.");
      return;
    }

    try {
      // Determine new question index at end
      const qp = await api.questionPapers.getById(params.id);
      const nextIndex = qp.data.questions?.length ?? 0;

      await api.questionPapers.createQuestionCmd(params.id, {
        text: values.text,
        marks: values.marks,
        index: nextIndex,
      });

      toast.success("Question added successfully!");

      await queryClient.invalidateQueries({
        queryKey: ["questionPaper", params.id as string],
      });

      // Refetch and navigate to last question
      const updated = await api.questionPapers.getById(params.id);
      const questions = updated.data.questions || [];
      const last = questions[questions.length - 1];
      if (last?.id) {
        navigate(`/question-paper/studio/${params.id}/${last.id}`);
      } else {
        navigate(`/question-paper/studio/${params.id}`);
      }
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to add question.");
    }
  }

  return (
    <div className="container mx-auto max-w-3xl min-w-xl p-4">
      <h1 className="text-2xl font-bold mt-6">Add New Question</h1>
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

        <Button type="submit" className="col-span-2" disabled={isSubmitting}>
          {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Adding..." : "Save Question"}
        </Button>
      </form>
    </div>
  );
}
