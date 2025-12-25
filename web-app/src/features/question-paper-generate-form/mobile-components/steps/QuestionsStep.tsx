import React from 'react';
import FormQuestionsSection from '../../components/FormQuestionsSection';
import { FormData } from '../../types';

interface QuestionsStepProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
}

/** Thin mobile wrapper around FormQuestionsSection (no logic duplication). */
export const QuestionsStep: React.FC<QuestionsStepProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      <FormQuestionsSection data={data} onUpdate={onUpdate} />
    </div>
  );
};

export default QuestionsStep;
