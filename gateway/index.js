import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecipeSchema, parseRecipeLeniently } from '../shared/schema.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'frontend/dist' folder
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MODEL_NAME = 'gemini-flash-lite-latest';

// ... (keep the rest of the file)
// Add the catch-all route at the end:
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
// });

// Clean markdown code blocks from model response
function cleanJsonResponse(text) {
  if (!text) return '';
  let cleaned = text.trim();
  // Strip ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

// Prompt generator
function buildPrompt(ingredients, refinement, currentRecipe) {
  if (refinement && currentRecipe) {
    return `You are an expert chef assistant.
Here is the current recipe:
${JSON.stringify(currentRecipe, null, 2)}

User request for modification: "${refinement}"

Please update the recipe according to this modification while keeping the same format.
CRITICAL REQUIREMENTS:
1. Return VALID JSON ONLY. No markdown, no conversational commentary.
2. Follow this JSON schema exactly:
{
  "title": "string",
  "servings": 2,
  "prepMinutes": 10,
  "cookMinutes": 20,
  "ingredients": [
    {
      "id": "i1",
      "name": "string",
      "quantity": 2,
      "unit": "string",
      "swaps": [{ "name": "string", "note": "string" }]
    }
  ],
  "steps": [
    { "id": "s1", "text": "string", "timerSeconds": 0 }
  ],
  "tips": "optional helpful cooking tip string"
}
3. If the refinement is impossible or completely nonsensical, return:
{ "error": "Friendly explanation of why the modification cannot be applied." }
`;
  }

  return `You are a creative, practical chef assistant.
The user opens their fridge and pantry and has: "${ingredients}"

Create a delicious, realistic recipe using these ingredients (and basic pantry staples like water, oil, salt, pepper).
CRITICAL REQUIREMENTS:
1. Return VALID JSON ONLY. No markdown text, no conversational text before or after.
2. If the user input consists of non-food items, gibberish, or dangerous items (e.g., "car keys", "asdf", "laptop", "bleach"), DO NOT make a recipe. Instead, return strictly:
{
  "error": "These items do not appear to be edible food ingredients. Please enter real food items found in your fridge or pantry!"
}
3. Otherwise, return a JSON object with this exact shape:
{
  "title": "Recipe Title",
  "servings": 2,
  "prepMinutes": 10,
  "cookMinutes": 20,
  "ingredients": [
    {
      "id": "i1",
      "name": "ingredient name",
      "quantity": 2,
      "unit": "tbsp/cups/pcs/grams",
      "swaps": [
        { "name": "substitute ingredient", "note": "why or how to use" }
      ]
    }
  ],
  "steps": [
    {
      "id": "s1",
      "text": "Step by step description...",
      "timerSeconds": 0
    }
  ],
  "tips": "A quick chef tip for best flavor"
}
4. Use numeric quantity (never string like "1/2", use 0.5) so scaling servings works.
5. Provide 1-2 realistic ingredient swaps where helpful.
6. For steps requiring timing (e.g. simmering, baking, resting), set timerSeconds appropriately (e.g. 300 for 5 minutes), otherwise 0.
`;
}

// Call Gemini with timeout support
async function callGemini(promptText, timeoutMs = 60000) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const fetchPromise = model.generateContent(promptText);
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('Model request timed out on server');
      err.name = 'TimeoutError';
      reject(err);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    clearTimeout(timer);
    return result.response.text();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Debug models endpoint
app.get('/api/debug/models', async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Mock handler for testing edge cases (?mock=malformed, ?mock=wrong_shape, ?mock=non_food, etc.)
function handleMockMode(mockType, res) {
  switch (mockType) {
    case 'malformed':
      // Malformed JSON that breaks JSON.parse
      return res.status(200).send('{"title": "Broken Salad", "servings": 2, "ingredients": [unclosed array');

    case 'wrong_shape':
      // JSON with unexpected keys and missing required fields
      return res.status(200).json({
        recipeName: 'Wrong Schema Stew',
        foodStuff: 'carrots',
        randomField: 42
      });

    case 'non_food':
      // Non-food rejected response
      return res.status(400).json({
        error: "These items ('car keys', 'battery', 'paperclips') do not appear to be food ingredients. Please provide edible pantry items."
      });

    case 'slow':
      // Simulates slow response (12s delay to trigger UI "taking longer than usual" warning)
      return setTimeout(() => {
        res.json({
          title: "Slow-Cooked Simmer Soup",
          servings: 2,
          prepMinutes: 10,
          cookMinutes: 30,
          ingredients: [
            { id: "i1", name: "Water", quantity: 4, unit: "cups", swaps: [] },
            { id: "i2", name: "Carrot", quantity: 2, unit: "pcs", swaps: [{ name: "Parsnip", note: "Earthier flavor" }] }
          ],
          steps: [
            { id: "s1", text: "Chop carrots and bring water to boil.", timerSeconds: 0 },
            { id: "s2", text: "Simmer for 20 minutes until tender.", timerSeconds: 1200 }
          ],
          tips: "Patience makes the broth sweeter."
        });
      }, 10000);

    case 'rate_limit':
      return res.status(429).json({
        error: "Rate limit exceeded (429). Too many requests sent to the AI service. Please wait 15 seconds."
      });

    case 'server_error':
      return res.status(500).json({
        error: "Internal AI processing error (500). The model encountered an unexpected state."
      });

    case 'partial_garbage':
      // Partial garbage: some invalid ingredients and steps mixed with valid ones
      return res.status(200).json({
        title: "Resilient Stir-Fry",
        servings: 2,
        prepMinutes: 5,
        cookMinutes: 10,
        ingredients: [
          { id: "i1", name: "Tofu", quantity: 200, unit: "g", swaps: [{ name: "Tempeh", note: "Firmer bite" }] },
          null, // garbage
          { invalid: "no name or qty" }, // garbage
          { id: "i2", name: "Soy Sauce", quantity: 2, unit: "tbsp", swaps: [] }
        ],
        steps: [
          { id: "s1", text: "Heat skillet with oil.", timerSeconds: 0 },
          { badStep: true }, // garbage
          { id: "s2", text: "Toss tofu and soy sauce until browned.", timerSeconds: 180 }
        ],
        tips: "Lenient parsing preserved the valid items!"
      });

    default:
      return null;
  }
}

// POST /api/recipe
app.post('/api/recipe', async (req, res) => {
  const { ingredients, refinement, currentRecipe } = req.body;
  const mockType = req.query.mock || req.body.mock;

  // Check for mock mode first
  if (mockType) {
    const handled = handleMockMode(mockType, res);
    if (handled !== null) return;
  }

  if (!ingredients && !refinement) {
    return res.status(400).json({ error: 'Please enter ingredients from your fridge.' });
  }

  let prompt = buildPrompt(ingredients, refinement, currentRecipe);

  try {
    let rawText = '';
    let parsedData = null;
    let attempts = 0;
    const maxAttempts = 2; // Auto-retry once on validation failure

    while (attempts < maxAttempts) {
      attempts++;
      try {
        rawText = await callGemini(prompt, 60000); // Increased to 60 seconds

        const cleaned = cleanJsonResponse(rawText);

        let parsedJson;
        try {
          parsedJson = JSON.parse(cleaned);
        } catch (jsonErr) {
          throw new Error(`Malformed JSON output from model: ${jsonErr.message}`);
        }

        // If AI indicated non-food error explicitly
        if (parsedJson.error && (!parsedJson.title || parsedJson.title.trim() === '')) {
          return res.status(400).json({ error: parsedJson.error });
        }

        // Lenient parsing with Zod validation
        const validated = parseRecipeLeniently(parsedJson);
        if ('error' in validated && validated.error) {
          return res.status(400).json({ error: validated.error });
        }

        parsedData = validated;
        break; // Successfully parsed and validated!
      } catch (validationOrCallError) {
        console.warn(`Attempt ${attempts} failed:`, validationOrCallError.message);

        // If it was a network timeout or rate limit, rethrow immediately
        if (validationOrCallError.name === 'TimeoutError' || validationOrCallError.message?.includes('429')) {
          throw validationOrCallError;
        }

        if (attempts >= maxAttempts) {
          throw validationOrCallError;
        }

        // Retry with feedback appended
        prompt = `${prompt}

NOTICE: Your previous output failed validation with the following error:
"${validationOrCallError.message}"
Please fix this issue and return strictly valid, parsable JSON adhering to the specified schema only.`;
      }
    }

    if (!parsedData) {
      return res.status(502).json({ error: 'Failed to obtain valid recipe structure after retry.' });
    }

    res.json(parsedData);
  } catch (error) {
    console.error('Error in /api/recipe:', error);

    if (error.name === 'TimeoutError') {
      return res.status(504).json({
        error: 'The recipe generation took too long (gateway timeout). Please check your connection and try again.'
      });
    }

    const message = error instanceof Error ? error.message : 'Internal error';
    if (message.includes('429')) {
      return res.status(429).json({
        error: 'AI service rate limit exceeded (429). Please wait a few seconds and click Retry.'
      });
    }

    res.status(500).json({
      error: `Recipe generation failed: ${message}`
    });
  }
});

// Handle React routing (serve index.html for all non-API requests)
// Using a regex to catch all routes that do not start with /api
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
