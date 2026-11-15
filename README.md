# Fridge-to-Recipe

A React application that generates recipes based on ingredients found in your fridge.

## Features
- Generates recipes using Gemini AI.
- Interactive UI: check off ingredients and steps.
- Scaling: adjust serving sizes dynamically.
- Robustness: automatic retries, timeouts, and error handling.
- Mock mode for testing failure scenarios.

## Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file with `GEMINI_API_KEY=your_key`.
4. Run `npm run dev`.

## Known Limitations
- Requires a valid API key with access to Gemini 3.5 Flash.
- Some complex refinement requests may not be handled perfectly by the AI.

## Time Spent
Approx. 8 hours.

## Design Decisions
- Used Zod for strict JSON validation to ensure the AI output matches the app requirements.
- Implemented `useRecipe` hook for centralized async state and error handling.
- Used `localStorage` for session persistence of ingredient check-offs and swaps.
