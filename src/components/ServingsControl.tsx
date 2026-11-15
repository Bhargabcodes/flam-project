import React from 'react';

interface Props {
  currentServings: number;
  baseServings: number;
  onUpdate: (newServings: number) => void;
  prepMinutes: number;
  cookMinutes: number;
}

export const ServingsControl: React.FC<Props> = ({
  currentServings,
  baseServings,
  onUpdate,
  prepMinutes,
  cookMinutes
}) => {
  return (
    <div className="servings-bar sticky-bar">
      <div className="meta-badges">
        <span className="badge">
          ⏱️ Prep: <strong>{prepMinutes} min</strong>
        </span>
        <span className="badge">
          🍳 Cook: <strong>{cookMinutes} min</strong>
        </span>
        <span className="badge">
          ⌛ Total: <strong>{prepMinutes + cookMinutes} min</strong>
        </span>
      </div>

      <div className="servings-stepper-wrap">
        <span className="stepper-label">Servings:</span>
        <div className="stepper">
          <button
            type="button"
            className="stepper-btn"
            onClick={() => onUpdate(Math.max(1, currentServings - 1))}
            disabled={currentServings <= 1}
            aria-label="Decrease servings"
          >
            −
          </button>
          <span className="stepper-value" aria-live="polite">
            <strong>{currentServings}</strong>
            {currentServings !== baseServings && (
              <span className="base-servings-note"> (orig: {baseServings})</span>
            )}
          </span>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => onUpdate(currentServings + 1)}
            disabled={currentServings >= 24}
            aria-label="Increase servings"
          >
            +
          </button>
        </div>

        {currentServings !== baseServings && (
          <button
            type="button"
            className="btn-link"
            onClick={() => onUpdate(baseServings)}
            title="Reset to original servings"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
