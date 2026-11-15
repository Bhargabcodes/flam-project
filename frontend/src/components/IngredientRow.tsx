import React, { useState } from 'react';
import type { Ingredient } from '../../../shared/schema.ts';
import { formatQuantity } from '../utils/format';
import { Repeat, RotateCcw } from 'lucide-react';

interface Props {
  ingredient: Ingredient;
  servingsMultiplier: number;
  isChecked: boolean;
  onToggleCheck: (id: string) => void;
  activeSwapName?: string;
  onSwap: (id: string, swapName: string) => void;
  onUndoSwap: (id: string) => void;
}

export const IngredientRow: React.FC<Props> = ({
  ingredient,
  servingsMultiplier,
  isChecked,
  onToggleCheck,
  activeSwapName,
  onSwap,
  onUndoSwap
}) => {
  const [showSwapDropdown, setShowSwapDropdown] = useState(false);

  const currentName = activeSwapName || ingredient.name;
  const scaledQty = ingredient.quantity * servingsMultiplier;
  const formattedQty = formatQuantity(scaledQty);
  const hasSwaps = ingredient.swaps && ingredient.swaps.length > 0;

  return (
    <li className={`ingredient-row ${isChecked ? 'checked' : ''}`} onClick={() => onToggleCheck(ingredient.id)}>
      <div className={`checkbox ${isChecked ? 'checked' : ''}`} />
      
      <div className="text">
        <strong>{formattedQty}</strong> {currentName}
        {activeSwapName && (
          <span style={{ fontSize: '12px', marginLeft: '8px', color: 'var(--accent)', fontWeight: 600 }}>
            (Swapped)
          </span>
        )}
      </div>

      {hasSwaps && !activeSwapName && (
        <button
          type="button"
          title="Swap ingredient"
          className="btn-swap-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setShowSwapDropdown(!showSwapDropdown);
          }}
        >
          <Repeat size={15} />
        </button>
      )}

      {activeSwapName && (
        <button
          type="button"
          title="Undo swap"
          className="btn-swap-toggle"
          onClick={(e) => {
            e.stopPropagation();
            onUndoSwap(ingredient.id);
          }}
        >
          <RotateCcw size={15} />
        </button>
      )}

      {showSwapDropdown && hasSwaps && (
        <div className="swap-popover" onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 10px', fontWeight: 600 }}>
            SWAP WITH:
          </div>
          {ingredient.swaps!.map((swapOption, idx) => (
            <button
              key={idx}
              type="button"
              className="swap-option"
              onClick={() => {
                onSwap(ingredient.id, swapOption.name);
                setShowSwapDropdown(false);
              }}
            >
              {swapOption.name}
            </button>
          ))}
        </div>
      )}
    </li>
  );
};
