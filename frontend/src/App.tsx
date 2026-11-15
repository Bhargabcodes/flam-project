import { useState, useEffect } from 'react';
import './App.css';
import { useRecipe } from './hooks/useRecipe';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
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
  const { theme, toggleTheme } = useTheme();
  
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
        <div className="logo-area">
          <h1>Fridge to Recipe</h1>
          <p className="tagline">Turn your leftovers into delicious meals using AI.</p>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <main className="app-main">
        {!recipe && (
          <section className="features-section" style={{marginBottom: '32px'}}>
            <div className="feature-grid">
              <div className="feature-card card" style={{padding: '16px', margin: 0}}>
                <strong>✨ Smart Generation</strong>
                <p style={{fontSize: '14px', margin: '4px 0 0 0'}}>Gemini AI creates custom recipes from your ingredients.</p>
              </div>
              <div className="feature-card card" style={{padding: '16px', margin: 0}}>
                <strong>⚡ Dynamic Scaling</strong>
                <p style={{fontSize: '14px', margin: '4px 0 0 0'}}>Automatically adjust serving sizes instantly.</p>
              </div>
              <div className="feature-card card" style={{padding: '16px', margin: 0}}>
                <strong>🥘 Easy Swapping</strong>
                <p style={{fontSize: '14px', margin: '4px 0 0 0'}}>Swap ingredients you don't have for better alternatives.</p>
              </div>
            </div>
          </section>
        )}

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
              <div className="recipe-header">
                <div>
                  <h2>{recipe.title}</h2>
                  <p style={{marginTop: '8px', marginBottom: '16px', color: 'var(--text-secondary)'}}>{recipe.description}</p>
                  <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                    {recipe.tags.map(tag => (
                      <span key={tag} className="gathered-pill">{tag}</span>
                    ))}
                  </div>
                </div>
                <ServingsControl 
                  currentServings={servings} 
                  onUpdate={setServings}
                  prepMinutes={recipe.prepMinutes}
                  cookMinutes={recipe.cookMinutes}
                />
              </div>
              
              <aside className="recipe-sidebar">
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
              </aside>
              
              <div className="steps-container">
                <StepList steps={recipe.steps} />
              </div>
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;
