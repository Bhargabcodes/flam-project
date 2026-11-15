import React, { useState } from 'react';
import type { Ingredient } from '../../../shared/schema.ts';
import { formatQuantity } from '../utils/format';

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
    <li className={`ingredient-row ${isChecked ? 'checked' : ''} ${activeSwapName ? 'swapped' : ''}`}>
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggleCheck(ingredient.id)}
          aria-label={`Check off ${currentName}`}
        />
        <span className="checkmark" />
      </label>

      <div className="ingredient-info">
        <span className="ingredient-text">
          <strong className="ingredient-qty">{formattedQty}</strong>{' '}
          <span className="ingredient-unit">{ingredient.unit}</span>{' '}
          <span className="ingredient-name">{currentName}</span>
        </span>

        {activeSwapName && (
          <span className="swap-badge">
            Replaced: <s>{ingredient.name}</s>
            <button
              type="button"
              className="undo-swap-btn"
              onClick={() => onUndoSwap(ingredient.id)}
              title="Undo swap"
            >
              ↺ Undo
            </button>
          </span>
        )}
      </div>

      {hasSwaps && !activeSwapName && (
        <div className="swap-action-wrap">
          <button
            type="button"
            className="btn-swap-toggle"
            onClick={() => setShowSwapDropdown(!showSwapDropdown)}
            title="Substitute this ingredient"
          >
            ⇄ Swap
          </button>

          {showSwapDropdown && (
            <div className="swap-dropdown-popover">
              <div className="swap-dropdown-header">
                <span>Substitutes for {ingredient.name}:</span>
                <button
                  type="button"
                  className="close-popover-btn"
                  onClick={() => setShowSwapDropdown(false)}
                >
                  ✕
                </button>
              </div>
              <ul className="swap-options-list">
                {ingredient.swaps?.map((swap) => (
                  <li key={swap.name} className="swap-option-item">
                    <button
                      type="button"
                      className="swap-option-btn"
                      onClick={() => {
                        onSwap(ingredient.id, swap.name);
                        setShowSwapDropdown(false);
                      }}
                    >
                      <span className="swap-name">{swap.name}</span>
                      {swap.note && <span className="swap-note">({swap.note})</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
};
