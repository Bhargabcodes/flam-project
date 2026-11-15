import React from 'react';
import type { Ingredient } from '../../../shared/schema.ts';
import { IngredientRow } from './IngredientRow';

interface Props {
  ingredients: Ingredient[];
  servingsMultiplier: number;
  checkedIds: Set<string>;
  onToggleCheck: (id: string) => void;
  swaps: Record<string, string>;
  onSwap: (id: string, swapName: string) => void;
  onUndoSwap: (id: string) => void;
}

export const IngredientList: React.FC<Props> = ({
  ingredients,
  servingsMultiplier,
  checkedIds,
  onToggleCheck,
  swaps,
  onSwap,
  onUndoSwap
}) => {
  const checkedCount = ingredients.filter((ing) => checkedIds.has(ing.id)).length;

  return (
    <section className="recipe-section ingredients-card card">
      <div className="section-title-row">
        <h3>
          <span className="icon">🥑</span> Ingredients
        </h3>
        <span className="count-badge">
          {checkedCount}/{ingredients.length} gathered
        </span>
      </div>

      <ul className="ingredient-list">
        {ingredients.map((ingredient) => (
          <IngredientRow
            key={ingredient.id}
            ingredient={ingredient}
            servingsMultiplier={servingsMultiplier}
            isChecked={checkedIds.has(ingredient.id)}
            onToggleCheck={onToggleCheck}
            activeSwapName={swaps[ingredient.id]}
            onSwap={onSwap}
            onUndoSwap={onUndoSwap}
          />
        ))}
      </ul>
    </section>
  );
};
