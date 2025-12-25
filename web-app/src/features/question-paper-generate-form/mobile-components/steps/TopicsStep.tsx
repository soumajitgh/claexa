import React from 'react';
import FormTopicsSection from '../../components/FormTopicsSection';
import { FormData } from '../../types';

interface TopicsStepProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
}

/** Thin mobile wrapper around FormTopicsSection (no logic duplication). */
export const TopicsStep: React.FC<TopicsStepProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      <FormTopicsSection data={data} onUpdate={onUpdate} />
    </div>
  );
};

export default TopicsStep;
