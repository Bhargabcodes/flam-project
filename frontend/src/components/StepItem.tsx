import React, { useState, useEffect } from 'react';
import type { Step } from '../../../shared/schema.ts';
import { Timer } from 'lucide-react';

interface Props {
  step: Step;
  index: number;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

export const StepItem: React.FC<Props> = ({ step, index, isChecked, onToggle }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(step.timerSeconds || 0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    if (timerRunning && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <li className={`step-item ${isChecked ? 'step-completed' : ''}`} style={{display: 'flex', gap: '16px', marginBottom: '24px', opacity: isChecked ? 0.5 : 1}}>
      <div className="step-badge" onClick={() => onToggle(step.id)} style={{
        width: '32px', height: '32px', borderRadius: '50%', 
        background: isChecked ? 'var(--accent)' : '#eee',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer'
      }}>
        {isChecked ? '✓' : index + 1}
      </div>
      <div className="step-content">
        <p style={{margin: '0 0 8px 0'}}>{step.text}</p>
        {step.timerSeconds > 0 && (
          <button className="btn-filled" style={{width: 'auto', padding: '4px 12px'}} onClick={() => setTimerRunning(!timerRunning)}>
            <Timer size={16} /> {timerRunning ? 'Pause' : formatTimer(secondsRemaining)}
          </button>
        )}
      </div>
    </li>
  );
};
