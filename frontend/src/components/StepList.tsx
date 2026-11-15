import React, { useState } from 'react';
import type { Recipe } from '../../../shared/schema.ts';
import { StepItem } from './StepItem';

interface Props {
  steps: Recipe['steps'];
}

export const StepList: React.FC<Props> = ({ steps }) => {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (id: string) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="card">
      <h3>Instructions</h3>
      <div className="step-list">
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            index={index}
            isChecked={checkedSteps.has(step.id)}
            onToggle={toggleStep}
          />
        ))}
      </div>
    </section>
  );
};
