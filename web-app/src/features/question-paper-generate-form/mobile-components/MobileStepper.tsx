import React from 'react';
import { cn } from '@/lib/utils';

export interface MobileStepperProps {
  current: number; // 0-based
  total: number;
  onStepChange?: (index: number) => void;
  labels?: string[]; // optional step labels (short)
}

/**
 * Compact mobile stepper with numbered circles and progress bar.
 * Uses CSS vars defined in theme for colours.
 */
export const MobileStepper: React.FC<MobileStepperProps> = ({ current, total, onStepChange, labels }) => {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {Array.from({ length: total }).map((_, idx) => {
          const active = idx === current;
          const completed = idx < current;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onStepChange?.(idx)}
              className={cn(
                'flex flex-col items-center flex-1 min-w-0 group',
                !onStepChange && 'cursor-default'
              )}
              disabled={idx > current + 1}
              aria-current={active ? 'step' : undefined}
            >
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-colors',
                  active && 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-sm',
                  completed && 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/40',
                  !active && !completed && 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
                )}
              >
                {idx + 1}
              </div>
              {labels && labels[idx] && (
                <span className={cn('mt-1 text-[10px] font-medium truncate max-w-[6ch]', active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')}>{labels[idx]}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="h-1 w-full rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className="h-full bg-[var(--primary)] transition-all"
          style={{ width: pct + '%' }}
          aria-hidden
        />
      </div>
    </div>
  );
};

export default MobileStepper;
