import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuestionPaperResponse {
  id: string;
  name: string;
  description?: string;
}

interface ManualQuestionPaperButtonProps {
  onSuccess?: (paper: QuestionPaperResponse) => void;
  trigger?: React.ReactNode;
}

export const ManualQuestionPaperButton: React.FC<
  ManualQuestionPaperButtonProps
> = ({ onSuccess, trigger }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsCreating(true);

    try {
      // Mock API call - in real implementation this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockPaper: QuestionPaperResponse = {
        id: `paper-${Date.now()}`,
        name: title.trim(),
        description: description.trim() || undefined,
      };

      setOpen(false);
      setTitle("");
      setDescription("");
      toast.success("Question paper created successfully!");
      onSuccess?.(mockPaper);
    } catch (error) {
      console.error("Error creating question paper:", error);
      toast.error("Failed to create question paper");
    } finally {
      setIsCreating(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline">
      <Plus className="w-4 h-4 mr-2" />
      Create New
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Question Paper</DialogTitle>
            <DialogDescription>
              Create a new question paper from scratch. You can add questions
              and customize it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter question paper title"
                disabled={isCreating}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description"
                disabled={isCreating}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !title.trim()}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
