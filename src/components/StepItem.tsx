import React, { useState, useEffect } from 'react';
import type { Step } from '../../shared/schema.ts';

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
            // Play a gentle beep if audio is supported
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
              gain.gain.setValueAtTime(0.3, ctx.currentTime);
              osc.start();
              osc.stop(ctx.currentTime + 0.6);
            } catch (e) {
              // Audio context not allowed or unsupported
            }
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

  const handleTimerToggle = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(step.timerSeconds);
    }
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setSecondsRemaining(step.timerSeconds);
  };

  const hasTimer = step.timerSeconds > 0;
  const timerFinished = hasTimer && secondsRemaining === 0 && !timerRunning;

  return (
    <li className={`step-item ${isChecked ? 'step-completed' : ''}`}>
      <label className="checkbox-container step-checkbox">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(step.id)}
          aria-label={`Mark step ${index + 1} as done`}
        />
        <span className="checkmark" />
      </label>

      <div className="step-content">
        <div className="step-header">
          <span className="step-number">Step {index + 1}</span>
          {hasTimer && (
            <div className={`step-timer-widget ${timerFinished ? 'timer-done' : ''} ${timerRunning ? 'timer-active' : ''}`}>
              <span className="timer-display">
                ⏱️ {formatTimer(secondsRemaining)}
              </span>
              <button
                type="button"
                className="timer-control-btn"
                onClick={handleTimerToggle}
              >
                {timerRunning ? 'Pause' : timerFinished ? 'Restart' : 'Start'}
              </button>
              {secondsRemaining !== step.timerSeconds && (
                <button
                  type="button"
                  className="timer-reset-btn"
                  onClick={handleTimerReset}
                  title="Reset timer"
                >
                  ↺
                </button>
              )}
            </div>
          )}
        </div>

        <p className="step-text">{step.text}</p>
      </div>
    </li>
  );
};
