import React, { useState } from 'react';
import { Wand2 } from 'lucide-react';

interface Props {
  onRefine: (instruction: string) => void;
  loading: boolean;
}

const QUICK_REFINES = ['🌶️ Make it spicy', '🌱 Make it vegan', '⚡ Under 15 mins', '🍳 One-pan only'];

export const RefinementInput: React.FC<Props> = ({ onRefine, loading }) => {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    onRefine(instruction);
    setInstruction('');
  };

  return (
    <form onSubmit={handleSubmit} className="refinement-form card">
      <label htmlFor="refinement-input" style={{ fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Wand2 size={16} color="var(--accent)" /> Modify this recipe
      </label>
      <div className="input-group">
        <input
          id="refinement-input"
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., make it dairy-free, add garlic..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !instruction.trim()}>
          {loading ? '...' : 'Update'}
        </button>
      </div>
      <div className="quick-refines">
        {QUICK_REFINES.map((tag) => (
          <button
            key={tag}
            type="button"
            className="chip-btn"
            style={{ fontSize: '12px', padding: '4px 10px' }}
            disabled={loading}
            onClick={() => onRefine(tag.replace(/^[^\w]+/, ''))}
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
};
