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

  const progress = Math.round((checkedSteps.size / steps.length) * 100);

  return (
    <section className="recipe-section steps-card card">
      <div className="section-title-row">
        <h3>
          <span className="icon">👨‍🍳</span> Instructions
        </h3>
        <span className="progress-text">
          {checkedSteps.size}/{steps.length} steps done ({progress}%)
        </span>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <ol className="step-list">
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            index={index}
            isChecked={checkedSteps.has(step.id)}
            onToggle={toggleStep}
          />
        ))}
      </ol>
    </section>
  );
};
