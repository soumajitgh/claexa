import React from 'react';
import FormTopicsSection from '../../components/FormTopicsSection';
import FormQuestionsSection from '../../components/FormQuestionsSection';
import { FormData } from '../../types';

interface CustomizeStepProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
}

/**
 * Customize Step combines topics and question pattern definition for a tighter mobile flow.
 */
export const CustomizeStep: React.FC<CustomizeStepProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Topics</h2>
        <FormTopicsSection data={data} onUpdate={onUpdate} />
      </div>
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Question Types</h2>
        <FormQuestionsSection data={data} onUpdate={onUpdate} />
      </div>
    </div>
  );
};

export default CustomizeStep;
