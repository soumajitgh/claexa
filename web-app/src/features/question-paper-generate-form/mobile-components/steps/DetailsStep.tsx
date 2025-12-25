import React from 'react';
import FormDetailsSection from '../../components/FormDetailsSection';
import { FormData } from '../../types';

interface DetailsStepProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
}

/**
 * Mobile Details Step: wraps existing desktop section with mobile-friendly spacing.
 */
export const DetailsStep: React.FC<DetailsStepProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-8">
      <FormDetailsSection data={data} onUpdate={onUpdate} />
    </div>
  );
};

export default DetailsStep;
