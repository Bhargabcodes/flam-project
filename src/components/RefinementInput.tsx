import React, { useState } from 'react';

interface Props {
  onRefine: (instruction: string) => void;
  loading: boolean;
}

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
      <label htmlFor="refinement-input">Modify this recipe:</label>
      <div className="input-group">
        <input
          id="refinement-input"
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., make it vegan, add more spice, no oven..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !instruction.trim()}>
          {loading ? '...' : 'Update'}
        </button>
      </div>
    </form>
  );
};
