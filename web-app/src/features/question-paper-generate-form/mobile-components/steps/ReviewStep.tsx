import React, { useMemo } from 'react';
import { FormData, QuestionPattern } from '../../types';
import { Button } from '@/components/ui/button';

interface ReviewStepProps {
  data: Partial<FormData>;
  onEditSection: (section: 'details' | 'customize') => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onEditSection }) => {
  const patterns: QuestionPattern[] = (data.questionPatterns as QuestionPattern[]) || [];

  const totals = useMemo(() => {
    const totalMarks = patterns.reduce((sum, p) => sum + p.count * p.marksEach, 0);
    const totalQuestions = patterns.reduce((sum, p) => sum + p.count, 0);
    return { totalMarks, totalQuestions };
  }, [patterns]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Course Details</h2>
          <Button size="sm" variant="ghost" onClick={() => onEditSection('details')}>Edit</Button>
        </div>
        <div className="rounded-lg border bg-[var(--card)] p-4 text-sm grid gap-2">
          <div><span className="text-[var(--muted-foreground)]">Subject:</span> {data.course || '—'}</div>
          <div><span className="text-[var(--muted-foreground)]">Institution Type:</span> {data.audience || '—'}</div>
          {data.board && <div><span className="text-[var(--muted-foreground)]">Board:</span> {data.board}</div>}
          {data.classLevel && <div><span className="text-[var(--muted-foreground)]">Class:</span> {data.classLevel}</div>}
          <div><span className="text-[var(--muted-foreground)]">Topics:</span> {(data.topics?.length || 0) > 0 ? data.topics?.join(', ') : 'None'}</div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Question Types</h2>
          <Button size="sm" variant="ghost" onClick={() => onEditSection('customize')}>Edit</Button>
        </div>
        {patterns.length === 0 ? (
          <div className="text-xs text-[var(--muted-foreground)] italic">No patterns added.</div>
        ) : (
          <div className="space-y-2">
            {patterns.map(p => (
              <div key={p.id} className="rounded-lg border bg-[var(--card)] p-4 text-xs flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.type}</div>
                  <div className="text-[var(--muted-foreground)]">{p.count} × {p.marksEach} marks • {p.difficulty}</div>
                </div>
                <div className="text-[11px] font-semibold ml-2">{p.count * p.marksEach}</div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t mt-4 text-xs">
          <span className="font-medium">Total Questions: {totals.totalQuestions}</span>
          <span className="font-medium">Total Marks: {totals.totalMarks}</span>
        </div>
      </section>
    </div>
  );
};

export default ReviewStep;
