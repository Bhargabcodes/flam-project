import { useState, useRef, useCallback } from 'react';
import type { Recipe } from '../../../shared/schema.ts';
import { parseRecipeLeniently } from '../../../shared/schema.ts';

interface FetchOptions {
  ingredients?: string;
  refinement?: string;
  currentRecipe?: Recipe | null;
  mock?: string;
}

export function useRecipe() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stale response tracking & request aborting
  const activeRequestIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const slowTimerRef = useRef<number | null>(null);

  // Store last options for retry functionality
  const lastOptionsRef = useRef<FetchOptions | null>(null);

  const fetchRecipe = useCallback(async (options: FetchOptions) => {
    lastOptionsRef.current = options;

    // 1. Cancel previous pending request to prevent race conditions & stale responses
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 2. Increment request ID
    const currentRequestId = ++activeRequestIdRef.current;

    // 3. Reset states
    setLoading(true);
    setIsSlow(false);
    setError(null);

    // 4. Start 8-second slow timer
    if (slowTimerRef.current) {
      window.clearTimeout(slowTimerRef.current);
    }
    slowTimerRef.current = window.setTimeout(() => {
      if (activeRequestIdRef.current === currentRequestId) {
        setIsSlow(true);
      }
    }, 8000);

    // 5. Client timeout (30 seconds)
    const timeoutId = window.setTimeout(() => {
      if (activeRequestIdRef.current === currentRequestId) {
        controller.abort();
      }
    }, 65000); // Increased to 65 seconds to match server timeout

    try {
      const url = options.mock 
        ? `http://localhost:3001/api/recipe?mock=${encodeURIComponent(options.mock)}`
        : 'http://localhost:3001/api/recipe';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          ingredients: options.ingredients,
          refinement: options.refinement,
          currentRecipe: options.currentRecipe,
          mock: options.mock
        })
      });

      // Clear client timeout
      window.clearTimeout(timeoutId);

      // Stale check: if a newer request began, discard this response
      if (currentRequestId !== activeRequestIdRef.current) {
        return;
      }

      const text = await response.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Received malformed response from server. Please try again.');
      }

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.error || 'Rate limit reached (429). Please wait a few moments before retrying.');
        }
        if (response.status === 504) {
          throw new Error('The request timed out (504). The AI took too long to respond.');
        }
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      // Check if server returned a non-food warning
      if (data.error && (!data.title || data.title.trim() === '')) {
        throw new Error(data.error);
      }

      // Client-side Zod validation & lenient recovery
      const parsedRecipe = parseRecipeLeniently(data);
      if ('error' in parsedRecipe && parsedRecipe.error) {
        throw new Error(parsedRecipe.error);
      }

      // Ensure response is applied only if still the active request
      if (currentRequestId === activeRequestIdRef.current) {
        setRecipe(parsedRecipe as Recipe);
        setError(null);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Disregard aborted requests unless it timed out
        if (currentRequestId === activeRequestIdRef.current && isSlow) {
          setError('Request timed out after 30 seconds. Please check your network and retry.');
        }
        return;
      }

      if (currentRequestId === activeRequestIdRef.current) {
        setError(err.message || 'An unexpected error occurred while creating your recipe.');
      }
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setLoading(false);
        setIsSlow(false);
        if (slowTimerRef.current) {
          window.clearTimeout(slowTimerRef.current);
          slowTimerRef.current = null;
        }
      }
    }
  }, [isSlow]);

  // Retry the exact last request
  const retry = useCallback(() => {
    if (lastOptionsRef.current) {
      fetchRecipe(lastOptionsRef.current);
    }
  }, [fetchRecipe]);

  // Refinement loop: modify existing recipe
  const refineRecipe = useCallback((instruction: string) => {
    if (!recipe) return;
    fetchRecipe({
      refinement: instruction,
      currentRecipe: recipe
    });
  }, [recipe, fetchRecipe]);

  const clearError = useCallback(() => setError(null), []);

  return {
    recipe,
    setRecipe,
    loading,
    isSlow,
    error,
    fetchRecipe,
    retry,
    refineRecipe,
    clearError
  };
}
