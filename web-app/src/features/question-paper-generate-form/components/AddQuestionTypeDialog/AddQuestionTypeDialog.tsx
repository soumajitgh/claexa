import { useState, useCallback, useEffect } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

import { QuestionPattern } from "../../types";
import AddSubQuestionDialog, {
  SubQuestionDraft,
} from "../AddSubQuestionDialog";
import BasicInfoTab from "./BasicInfoTab";
import AdvancedTab from "./AdvancedTab";
import SubQuestionsTab from "./SubQuestionsTab";

export interface PatternFormData {
  type: string;
  count: number;
  marksEach: number;
  difficulty: "very-easy" | "easy" | "medium" | "hard" | "very-hard";
  imageRequired: boolean;
  subQuestions: SubQuestionDraft[];
  bloomLevel?: number;
  targetTopic?: string;
  selectedTopics?: string[];
}

interface AddQuestionTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (pattern: QuestionPattern) => void;
  topics: string[];
  initialData?: QuestionPattern;
  isEdit?: boolean;
}

export default function AddQuestionTypeDialog({
  open,
  onOpenChange,
  onSave,
  topics,
  initialData,
  isEdit = false,
}: AddQuestionTypeDialogProps) {
  const [formData, setFormData] = useState<PatternFormData>({
    type: "",
    count: 0,
    marksEach: 0,
    difficulty: "medium",
    imageRequired: false,
    subQuestions: [],
    selectedTopics: [],
  });

  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingSubQuestionIndex, setEditingSubQuestionIndex] = useState<
    number | null
  >(null);

  // Initialize form data when dialog opens or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          type: initialData.type,
          count: initialData.count,
          marksEach: initialData.marksEach,
          difficulty: initialData.difficulty,
          imageRequired: initialData.imageRequired,
          subQuestions: initialData.subQuestions ?? [],
          bloomLevel: initialData.bloomLevel,
          targetTopic: initialData.targetTopic,
          selectedTopics: (initialData as PatternFormData).selectedTopics ?? [],
        });
      } else {
        // Reset to empty values for new pattern - user must explicitly enter values
        setFormData({
          type: "",
          count: 0,
          marksEach: 0,
          difficulty: "medium",
          imageRequired: false,
          subQuestions: [],
          selectedTopics: [],
        });
      }
    }
  }, [open, initialData]);

  const handleClose = useCallback(() => {
    setIsSubDialogOpen(false);
    setEditingSubQuestionIndex(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSave = useCallback(() => {
    if (!formData.type.trim()) return;

    const newPattern: QuestionPattern = {
      id: initialData?.id || `pattern_${Date.now()}`,
      ...formData,
      type: formData.type.trim(),
    };

    onSave(newPattern);
    handleClose();
  }, [formData, initialData, onSave, handleClose]);

  const handleSubDialogOpenChange = useCallback((open: boolean) => {
    setIsSubDialogOpen(open);
    if (!open) {
      setEditingSubQuestionIndex(null);
    }
  }, []);

  const handleSaveSubQuestion = useCallback(
    (subQuestion: SubQuestionDraft) => {
      setFormData((prev) => {
        const nextSubQuestions = [...prev.subQuestions];
        if (editingSubQuestionIndex !== null) {
          nextSubQuestions[editingSubQuestionIndex] = subQuestion;
        } else {
          nextSubQuestions.push(subQuestion);
        }
        return { ...prev, subQuestions: nextSubQuestions };
      });
      setEditingSubQuestionIndex(null);
      setIsSubDialogOpen(false);
    },
    [editingSubQuestionIndex]
  );

  const canSave = formData.type.trim().length > 0;

  const totalMarks =
    formData.count * formData.marksEach +
    formData.subQuestions.reduce(
      (sum, sub) => sum + sub.count * sub.marksEach,
      0
    );

  const totalQuestions =
    formData.count +
    formData.subQuestions.reduce((sum, sub) => sum + sub.count, 0);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader className="w-full">
            <SheetTitle>
              {isEdit ? "Edit Question Type" : "Add New Question Type"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1">
            <Accordion
              type="multiple"
              defaultValue={["info"]}
              className="space-y-0.5"
            >
              <AccordionItem value="info">
                <AccordionTrigger className="text-base font-semibold bg-accent px-4">
                  Basic Information
                </AccordionTrigger>
                <AccordionContent className="py-4 px-6">
                  <BasicInfoTab formData={formData} setFormData={setFormData} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="subquestions">
                <AccordionTrigger className="text-base font-semibold bg-accent px-4">
                  Sub Questions
                </AccordionTrigger>
                <AccordionContent className="py-4 px-6">
                  <SubQuestionsTab
                    formData={formData}
                    setFormData={setFormData}
                    onAddSubQuestion={() => {
                      setEditingSubQuestionIndex(null);
                      setIsSubDialogOpen(true);
                    }}
                    onEditSubQuestion={(index: number) => {
                      setEditingSubQuestionIndex(index);
                      setIsSubDialogOpen(true);
                    }}
                    totalMarks={totalMarks}
                    totalQuestions={totalQuestions}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced">
                <AccordionTrigger className="text-base font-semibold bg-accent px-4">
                  Advanced Settings
                </AccordionTrigger>
                <AccordionContent className="py-4 px-6">
                  <AdvancedTab
                    formData={formData}
                    setFormData={setFormData}
                    topics={topics}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <SheetFooter>
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full"
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? "Update" : "Add"} Question Type
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AddSubQuestionDialog
        open={isSubDialogOpen}
        onOpenChange={handleSubDialogOpenChange}
        onSave={handleSaveSubQuestion}
        initialData={
          editingSubQuestionIndex !== null
            ? formData.subQuestions[editingSubQuestionIndex]
            : undefined
        }
      />
    </>
  );
}
