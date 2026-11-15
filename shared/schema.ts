import { z } from 'zod';

export const SwapOptionSchema = z.object({
  name: z.string(),
  note: z.string().optional().default('')
});

export const IngredientSchema = z.object({
  id: z.string().default(() => `ing-${Math.random().toString(36).substring(2, 9)}`),
  name: z.string(),
  quantity: z.number().min(0).default(1),
  unit: z.string().default('item'),
  swaps: z.array(SwapOptionSchema).optional().default([])
});

export const StepSchema = z.object({
  id: z.string().default(() => `step-${Math.random().toString(36).substring(2, 9)}`),
  text: z.string(),
  timerSeconds: z.number().min(0).default(0)
});

export const RecipeSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  servings: z.number().min(1).default(2),
  prepMinutes: z.number().min(0).default(0),
  cookMinutes: z.number().min(0).default(0),
  ingredients: z.array(IngredientSchema).min(1, 'At least one ingredient is required'),
  steps: z.array(StepSchema).min(1, 'At least one step is required'),
  tips: z.string().optional(),
  error: z.string().optional()
});

export const NonFoodSchema = z.object({
  error: z.string().min(1)
});

export const RecipeResponseSchema = z.union([
  NonFoodSchema,
  RecipeSchema
]);

export type SwapOption = z.infer<typeof SwapOptionSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;
export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;

// Lenient parser utility: strips bad items instead of dropping the entire recipe
export function parseRecipeLeniently(raw: any): Recipe | { error: string } {
  if (!raw || typeof raw !== 'object') {
    throw new Error('AI output was not a valid JSON object');
  }

  if (raw.error && typeof raw.error === 'string' && (!raw.title || raw.title.trim() === '')) {
    return { error: raw.error };
  }

  // Sanitize ingredients array leniently
  const rawIngredients = Array.isArray(raw.ingredients) ? raw.ingredients : [];
  const validIngredients: Ingredient[] = [];
  rawIngredients.forEach((item: any, idx: number) => {
    if (!item) return;
    const parsed = IngredientSchema.safeParse({
      id: item.id || `i${idx + 1}`,
      name: item.name || item.ingredient || (typeof item === 'string' ? item : 'Ingredient'),
      quantity: typeof item.quantity === 'number' ? item.quantity : (parseFloat(item.quantity) || 1),
      unit: item.unit || 'pcs',
      swaps: Array.isArray(item.swaps) ? item.swaps : []
    });
    if (parsed.success) {
      validIngredients.push(parsed.data);
    }
  });

  // Sanitize steps array leniently
  const rawSteps = Array.isArray(raw.steps) ? raw.steps : [];
  const validSteps: Step[] = [];
  rawSteps.forEach((step: any, idx: number) => {
    if (!step) return;
    const text = typeof step === 'string' ? step : (step.text || step.instruction || '');
    if (!text.trim()) return;
    const parsed = StepSchema.safeParse({
      id: step.id || `s${idx + 1}`,
      text: text.trim(),
      timerSeconds: typeof step.timerSeconds === 'number' ? Math.max(0, step.timerSeconds) : 0
    });
    if (parsed.success) {
      validSteps.push(parsed.data);
    }
  });

  if (validIngredients.length === 0 || validSteps.length === 0) {
    if (raw.error) {
      return { error: raw.error };
    }
    throw new Error('Recipe must contain at least one valid ingredient and one step');
  }

  const recipeCandidate = {
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'Quick Fridge Recipe',
    servings: typeof raw.servings === 'number' && raw.servings > 0 ? raw.servings : 2,
    prepMinutes: typeof raw.prepMinutes === 'number' ? raw.prepMinutes : 10,
    cookMinutes: typeof raw.cookMinutes === 'number' ? raw.cookMinutes : 15,
    ingredients: validIngredients,
    steps: validSteps,
    tips: typeof raw.tips === 'string' ? raw.tips : undefined,
    error: raw.error
  };

  return RecipeSchema.parse(recipeCandidate);
}
