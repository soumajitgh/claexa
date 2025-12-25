import { useState, useCallback, useMemo } from "react";

import { FormData, QuestionPattern } from "../types";
import QuestionPatternsList from "./QuestionPatternsList";
import AddQuestionTypeDialog from "./AddQuestionTypeDialog";

interface FormQuestionsSectionProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
}

export default function FormQuestionsSection({
  data,
  onUpdate,
}: FormQuestionsSectionProps) {
  const patterns = useMemo(
    () => data.questionPatterns || [],
    [data.questionPatterns]
  );
  const topics = useMemo(() => data.topics || [], [data.topics]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<
    QuestionPattern | undefined
  >(undefined);

  const handleOpenDialog = useCallback(() => {
    setEditingPattern(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleEditPattern = useCallback((pattern: QuestionPattern) => {
    setEditingPattern(pattern);
    setIsDialogOpen(true);
  }, []);

  const handleSavePattern = useCallback(
    (pattern: QuestionPattern) => {
      let newPatterns: QuestionPattern[];

      if (editingPattern) {
        // Update existing pattern
        newPatterns = patterns.map((p) => (p.id === pattern.id ? pattern : p));
      } else {
        // Add new pattern
        newPatterns = [...patterns, pattern];
      }

      onUpdate({ questionPatterns: newPatterns });
    },
    [editingPattern, patterns, onUpdate]
  );

  const handleDeletePattern = useCallback(
    (patternId: string) => {
      const newPatterns = patterns.filter((p) => p.id !== patternId);
      onUpdate({ questionPatterns: newPatterns });
    },
    [patterns, onUpdate]
  );

  return (
    <div>
      <div className="space-y-6">
        {/* Pattern List */}
        <QuestionPatternsList
          patterns={patterns}
          onEditPattern={handleEditPattern}
          onDeletePattern={handleDeletePattern}
          onAddPattern={handleOpenDialog}
        />
      </div>

      <AddQuestionTypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSavePattern}
        topics={topics}
        initialData={editingPattern}
        isEdit={!!editingPattern}
      />
    </div>
  );
}
