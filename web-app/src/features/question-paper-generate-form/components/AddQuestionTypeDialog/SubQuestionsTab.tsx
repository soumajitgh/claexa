import React, { useCallback } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PatternFormData } from "./AddQuestionTypeDialog";

interface SubQuestionsTabProps {
  formData: PatternFormData;
  setFormData: React.Dispatch<React.SetStateAction<PatternFormData>>;
  onAddSubQuestion: () => void;
  onEditSubQuestion: (index: number) => void;
  totalMarks: number;
  totalQuestions: number;
}

export default function SubQuestionsTab({
  formData,
  setFormData,
  onAddSubQuestion,
  onEditSubQuestion,
  totalMarks,
  totalQuestions,
}: SubQuestionsTabProps) {
  const handleRemoveSubQuestion = useCallback(
    (index: number) => {
      setFormData((prev) => ({
        ...prev,
        subQuestions: prev.subQuestions.filter((_, idx) => idx !== index),
      }));
    },
    [setFormData]
  );

  return (
    <div className="space-y-6">
      <Button
        onClick={onAddSubQuestion}
        className="w-full"
        variant="outline"
        size="lg"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Sub-question
      </Button>

      {formData.subQuestions.length > 0 ? (
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Sub-questions ({formData.subQuestions.length})
          </Label>
          <div className="space-y-3">
            {formData.subQuestions.map((sub, index) => (
              <Card key={`${sub.type}-${index}`} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{sub.type}</div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{sub.count} questions</span>
                      <span>{sub.marksEach} marks each</span>
                      {sub.bloomLevel && <span>Bloom {sub.bloomLevel}</span>}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      Total: {sub.count * sub.marksEach} marks
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSubQuestion(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No sub-questions added yet</p>
          <p className="text-xs mt-1">
            Sub-questions are optional but help create more structured questions
          </p>
        </div>
      )}

      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <div className="font-medium">Final Summary</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Main questions: {formData.count}</div>
          <div>
            Sub-questions:{" "}
            {formData.subQuestions.reduce((sum, sub) => sum + sub.count, 0)}
          </div>
          <div>Total questions: {totalQuestions}</div>
          <div>Total marks: {totalMarks}</div>
        </div>
      </div>
    </div>
  );
}
