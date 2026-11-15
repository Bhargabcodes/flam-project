import { useState, useEffect } from 'react';
import './App.css';
import { useRecipe } from './hooks/useRecipe';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { IngredientInput } from './components/IngredientInput';
import { ServingsControl } from './components/ServingsControl';
import { IngredientList } from './components/IngredientList';
import { StepList } from './components/StepList';
import { RefinementInput } from './components/RefinementInput';

function App() {
  const [ingredients, setIngredients] = useState('');
  const [mock, setMock] = useState('');
  const { recipe, setRecipe, loading, error, isSlow, fetchRecipe, retry, refineRecipe, clearError } = useRecipe();
  
  // State for check-offs and swaps (persisted in local storage)
  const [checkedIngredients, setCheckedIngredients] = useLocalStorage<string[]>('checkedIngredients', []);
  const [swaps, setSwaps] = useLocalStorage<Record<string, string>>('swaps', {});

  // Sync servings with recipe
  const [servings, setServings] = useState(1);
  useEffect(() => {
    if (recipe) setServings(recipe.servings);
  }, [recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setCheckedIngredients([]);
    setSwaps({});
    await fetchRecipe({ ingredients, mock });
  };

  const handleToggleIngredient = (id: string) => {
    setCheckedIngredients(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSwap = (id: string, swapName: string) => {
    setSwaps(prev => ({ ...prev, [id]: swapName }));
  };

  const handleUndoSwap = (id: string) => {
    setSwaps(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const servingsMultiplier = recipe ? servings / recipe.servings : 1;

  return (
    <div className="App">
      <header className="app-header">
        <h1>Fridge to Recipe</h1>
      </header>

      <main className="app-main">
        <IngredientInput
          value={ingredients}
          onChange={setIngredients}
          onSubmit={handleSubmit}
          loading={loading}
          selectedMock={mock}
          onMockChange={setMock}
        />
        
        {loading && <LoadingSkeleton />}

        {isSlow && (
          <div className="warning-banner">
            Still working on your recipe... thanks for your patience!
          </div>
        )}

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={retry}>Retry</button>
          </div>
        )}

        <ErrorBoundary onReset={() => setRecipe(null)}>
          {recipe && (
            <div className="recipe-view">
              <h2>{recipe.title}</h2>
              <ServingsControl 
                currentServings={servings} 
                baseServings={recipe.servings} 
                onUpdate={setServings}
                prepMinutes={recipe.prepMinutes}
                cookMinutes={recipe.cookMinutes}
              />
              
              <IngredientList 
                ingredients={recipe.ingredients} 
                servingsMultiplier={servingsMultiplier}
                checkedIds={new Set(checkedIngredients)}
                onToggleCheck={handleToggleIngredient}
                swaps={swaps}
                onSwap={handleSwap}
                onUndoSwap={handleUndoSwap}
              />
              
              <RefinementInput onRefine={refineRecipe} loading={loading} />
              
              <StepList steps={recipe.steps} />
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
