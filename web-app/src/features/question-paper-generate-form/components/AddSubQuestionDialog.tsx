import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import QuestionTypeInput from "./QuestionTypeInput";

const subQuestionSchema = z.object({
  type: z.string().min(1, "Type is required"),
  count: z
    .number({ invalid_type_error: "Count is required" })
    .int()
    .positive("Count is required"),
  marksEach: z
    .number({ invalid_type_error: "Marks each is required" })
    .int()
    .positive("Marks each is required"),
  bloomLevel: z
    .union([z.number().int().min(1).max(6), z.undefined()])
    .optional(),
});

export type SubQuestionDraft = {
  type: string;
  count: number;
  marksEach: number;
  bloomLevel?: number;
};

export type AddSubQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: SubQuestionDraft) => void;
  initialData?: SubQuestionDraft | null;
};

export default function AddSubQuestionDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: AddSubQuestionDialogProps) {
  const form = useForm<z.input<typeof subQuestionSchema>>({
    resolver: zodResolver(subQuestionSchema),
    defaultValues: {
      type: "",
      count: 0,
      marksEach: 0,
      bloomLevel: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      form.reset(
        {
          ...initialData,
          bloomLevel: initialData.bloomLevel ?? undefined,
        },
        { keepDefaultValues: false }
      );
    } else {
      form.reset(
        {
          type: "",
          count: 0,
          marksEach: 0,
          bloomLevel: undefined,
        },
        { keepDefaultValues: false }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSave = (values: z.input<typeof subQuestionSchema>) => {
    const parsed = subQuestionSchema.parse({
      ...values,
      count: Number(values.count),
      marksEach: Number(values.marksEach),
      bloomLevel: values.bloomLevel ? Number(values.bloomLevel) : undefined,
    });

    onSave(parsed);
    onOpenChange(false);
    form.reset({
      type: "",
      count: 0,
      marksEach: 0,
      bloomLevel: undefined,
    });
  };

  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit sub-question" : "Add sub-question"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <QuestionTypeInput
                      value={field.value ?? ""}
                      onChange={(nextValue) =>
                        form.setValue("type", nextValue, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of questions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={field.value || ""}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value) || 0)
                        }
                        placeholder="Enter quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marksEach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks per question</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={field.value || ""}
                        onChange={(event) =>
                          field.onChange(Number(event.target.value) || 0)
                        }
                        placeholder="Enter marks"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bloomLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bloom level (optional)</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(nextValue) =>
                          field.onChange(
                            nextValue ? Number(nextValue) : undefined
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Bloom level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => handleSave(form.getValues())}>
            {isEditing ? "Update sub-question" : "Add sub-question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
