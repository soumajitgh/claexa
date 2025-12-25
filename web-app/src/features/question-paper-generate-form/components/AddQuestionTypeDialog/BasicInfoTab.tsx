import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FlaskConical  } from 'lucide-react';

import QuestionTypeInput from '../QuestionTypeInput';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PatternFormData } from './AddQuestionTypeDialog';

interface BasicInfoTabProps {
  formData: PatternFormData;
  setFormData: React.Dispatch<React.SetStateAction<PatternFormData>>;
}

export default function BasicInfoTab({
  formData,
  setFormData,
}: BasicInfoTabProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2 col-span-2 md:grid-span-1">
        <Label>Question Type</Label>
        <QuestionTypeInput
          value={formData.type}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, type: value }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Number of Questions *</Label>
        <Input
          type="number"
          min="1"
          max="50"
          value={formData.count || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              count: parseInt(e.target.value, 10) || 0,
            }))
          }
          placeholder="Enter quantity"
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label>Marks per question *</Label>
        <Input
          type="number"
          min="1"
          max="100"
          value={formData.marksEach || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              marksEach: parseInt(e.target.value, 10) || 0,
            }))
          }
          placeholder="Enter marks"
          className="text-lg"
        />
      </div>

      <div className="space-y-3 col-span-2">
        <Label className="text-base font-medium">Difficulty</Label>
        <div className="space-y-4 w-full">
          {/* Slider Track */}
          <div className="relative">
            <Slider
              min={0}
              max={4}
              step={1}
              value={[
                formData.difficulty === "very-easy"
                  ? 0
                  : formData.difficulty === "easy"
                  ? 1
                  : formData.difficulty === "medium"
                  ? 2
                  : formData.difficulty === "hard"
                  ? 3
                  : 4,
              ]}
              onValueChange={(value) => {
                const difficultyMap: {
                  [key: number]: "very-easy" | "easy" | "medium" | "hard" | "very-hard";
                } = {
                  0: "very-easy",
                  1: "easy",
                  2: "medium",
                  3: "hard",
                  4: "very-hard",
                };
                setFormData((prev) => ({
                  ...prev,
                  difficulty: difficultyMap[value[0]],
                }));
              }}
              className="w-full"
            />
          </div>

          {/* Slider Labels */}
          <div className="flex justify-between text-sm text-muted-foreground px-1">
            <span>Very Easy</span>
            <span>Easy</span>
            <span>Medium</span>
            <span>Hard</span>
            <span>Very Hard</span>
          </div>
        </div>
      </div>

      <div className=" col-span-2 flex items-center justify-between p-2 bg-gray-100 rounded-md">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium">Image needed?</Label>
          <Badge variant="default" className="text-xs flex items-center gap-1">
            <FlaskConical className="h-3 w-3" />
            Experimental
          </Badge>
        </div>
        <Switch
          checked={formData.imageRequired}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, imageRequired: checked }))
          }
        />
      </div>
    </div>
  );
}
