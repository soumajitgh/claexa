import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import FilterTopics from './FilterTopics';
import { PatternFormData } from './AddQuestionTypeDialog';

interface AdvancedTabProps {
  formData: PatternFormData;
  setFormData: React.Dispatch<React.SetStateAction<PatternFormData>>;
  topics: string[];
}

export default function AdvancedTab({
  formData,
  setFormData,
  topics,
}: AdvancedTabProps) {
  return (

      <div className="space-y-6">
        {topics.length > 0 && (
          <FilterTopics
            topics={topics}
            selectedTopics={formData.selectedTopics || []}
            onTopicsChange={(selectedTopics) =>
              setFormData((prev) => ({ ...prev, selectedTopics }))
            }
          />
        )}

        <div className="space-y-2">
          <Label >Bloom's Taxonomy Level</Label>
          <Select
            value={formData.bloomLevel !== undefined ? String(formData.bloomLevel) : 'any'}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                bloomLevel: value === 'any' ? undefined : parseInt(value, 10),
              }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any level</SelectItem>
              <SelectItem value="0">Automatic</SelectItem>
              <SelectItem value="1">1 - Remember (Recall facts)</SelectItem>
              <SelectItem value="2">2 - Understand (Explain concepts)</SelectItem>
              <SelectItem value="3">3 - Apply (Use knowledge)</SelectItem>
              <SelectItem value="4">4 - Analyze (Break down info)</SelectItem>
              <SelectItem value="5">5 - Evaluate (Make judgments)</SelectItem>
              <SelectItem value="6">6 - Create (Produce new work)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
  );
}
