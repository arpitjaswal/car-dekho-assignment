import { Router } from 'express';
import { getRecommendations } from '../services/scorer.js';
import { generateExplanation } from '../services/geminiService.js';
import { saveSearch } from '../services/historyService.js';

const router = Router();

router.post('/', async (req, res) => {
  const { budget, familySize, usage, priority } = req.body;

  if (!budget || !familySize || !usage || !priority) {
    return res.status(400).json({
      error: 'Missing required fields: budget, familySize, usage, priority',
    });
  }

  // Step 1: score all 50 cars → top 3
  const { recommendations, totalCarsScored, answers } = getRecommendations({
    budget, familySize, usage, priority,
  });

  // Step 2: Gemini explains the top 3 in plain Indian-market prose
  let explanation = null;
  try {
    explanation = await generateExplanation(answers, recommendations);
  } catch (err) {
    console.error('Gemini error:', err.message);
    // non-fatal — response still returns without explanation
  }

  // Step 3: persist to history.json
  const historyEntry = saveSearch(answers, recommendations);

  // Step 4: unified response
  res.json({
    recommendations,
    explanation,
    totalCarsScored,
    answers,
    searchId: historyEntry.id,
  });
});

export default router;
