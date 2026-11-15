import React, { useState } from 'react';
import { Sparkle, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  selectedMock: string;
  onMockChange: (mock: string) => void;
}

const PRESETS = [
  { label: '🥗 Fresh Salad', ingredients: 'Lettuce, cherry tomatoes, cucumber, red onion, olive oil, cider vinegar, salt, pepper' },
  { label: '🍳 Quick Breakfast', ingredients: '3 eggs, 1 cup spinach, 2 slices stale sourdough bread, cheddar cheese, butter, black pepper' },
  { label: '🥡 Fridge Stir-Fry', ingredients: 'Leftover white rice, 2 carrots, frozen peas, soy sauce, sesame oil, garlic, 1 egg' }
];

export const IngredientInput: React.FC<Props> = ({
  value,
  onChange,
  onSubmit,
  loading,
  selectedMock,
  onMockChange
}) => {
  const [showDevOptions, setShowDevOptions] = useState(false);
  // Split on both commas and newlines to match helper text
  const chips = value.split(/[\n,]+/).map(i => i.trim()).filter(Boolean);

  const removeChip = (index: number) => {
    const newChips = [...chips];
    newChips.splice(index, 1);
    onChange(newChips.join(', '));
  };

  return (
    <section className="input-section card">
      <div className="section-header" style={{ marginBottom: '14px' }}>
        <label htmlFor="ingredient-textarea" style={{ fontSize: '20px', fontWeight: 700, display: 'block' }}>
          What’s in your fridge?
        </label>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0' }}>
          Separate ingredients with commas or new lines
        </p>
      </div>

      <form onSubmit={onSubmit} className="ingredient-form">
        <textarea
          id="ingredient-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 3 eggs, spinach, sourdough bread, cheddar..."
          disabled={loading}
          style={{ marginBottom: '12px' }}
        />

        {chips.length > 0 && (
          <div className="chips-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {chips.map((chip, index) => (
              <span key={index} className="ingredient-chip">
                {chip}
                <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeChip(index)} />
              </span>
            ))}
          </div>
        )}

        <div className="presets-bar" style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Try an example:
          </p>
          <div className="preset-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

        <button type="submit" disabled={loading || !value.trim()} className="btn-filled">
          <Sparkle size={18} /> {loading ? 'Generating Recipe...' : 'Generate Recipe'}
        </button>

        <div className="dev-options" style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <button
            type="button"
            onClick={() => setShowDevOptions(!showDevOptions)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
          >
            Developer options {showDevOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {showDevOptions && (
            <select
              value={selectedMock}
              onChange={(e) => onMockChange(e.target.value)}
              style={{ marginTop: '8px', width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
            >
              <option value="">Live AI (Gemini)</option>
              <option value="malformed">Malformed JSON</option>
              <option value="non_food">Non-Food Input Rejected</option>
            </select>
          )}
        </div>
      </form>
    </section>
  );
};
