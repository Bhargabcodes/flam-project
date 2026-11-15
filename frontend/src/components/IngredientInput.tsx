import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  selectedMock: string;
  onMockChange: (mock: string) => void;
}

const PRESETS = [
  {
    label: '🥬 Fresh Salad',
    ingredients: 'Lettuce, cherry tomatoes, cucumber, red onion, olive oil, cider vinegar, salt, pepper'
  },
  {
    label: '🍳 Quick Breakfast',
    ingredients: '3 eggs, 1 cup spinach, 2 slices stale sourdough bread, cheddar cheese, butter, black pepper'
  },
  {
    label: '🍜 Fridge Stir-Fry',
    ingredients: 'Leftover white rice, 2 carrots, frozen peas, soy sauce, sesame oil, garlic, 1 egg'
  },
  {
    label: '🚫 Non-Food (Test)',
    ingredients: 'car keys, plastic lego brick, AA battery, cardboard box'
  }
];

export const IngredientInput: React.FC<Props> = ({
  value,
  onChange,
  onSubmit,
  loading,
  selectedMock,
  onMockChange
}) => {
  return (
    <section className="input-section card">
      <div className="section-header">
        <label htmlFor="ingredient-textarea" className="input-label">
          <span className="icon">🧊</span> What's in your fridge & pantry?
        </label>
        <span className="character-hint">List whatever leftovers or basics you have</span>
      </div>

      <form onSubmit={onSubmit} className="ingredient-form">
        <textarea
          id="ingredient-textarea"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 2 eggs, handful of spinach, half an onion, cold cooked rice, soy sauce..."
          disabled={loading}
          className="ingredient-textarea"
        />

        <div className="presets-bar">
          <span className="presets-title">Quick presets:</span>
          <div className="preset-chips">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="chip-btn"
                disabled={loading}
                onClick={() => onChange(preset.ingredients)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <div className="mock-selector-wrap">
            <label htmlFor="mock-mode-select" className="mock-label">
              🧪 Failure Test Mode:
            </label>
            <select
              id="mock-mode-select"
              value={selectedMock}
              onChange={(e) => onMockChange(e.target.value)}
              disabled={loading}
              className="mock-select"
            >
              <option value="">🟢 Live AI (Gemini)</option>
              <option value="malformed">🔴 Malformed JSON</option>
              <option value="wrong_shape">🔴 Wrong Schema / Shape</option>
              <option value="non_food">🔴 Non-Food Input Rejected</option>
              <option value="slow">🟡 Slow Response (8s Warning)</option>
              <option value="rate_limit">🔴 429 Rate Limit Error</option>
              <option value="server_error">🔴 500 AI Server Error</option>
              <option value="partial_garbage">🟡 Partial Garbage (Lenient Zod)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="btn btn-primary generate-btn"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Cooking up recipe...
              </>
            ) : (
              '✨ Generate Recipe'
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
