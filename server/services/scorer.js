import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cars = JSON.parse(readFileSync(join(__dirname, '../data/cars.json'), 'utf-8'));

// ─── Budget limits in INR ────────────────────────────────────────────────────
const BUDGET_LIMITS = {
  under5L:  500000,
  '5to10L': 1000000,
  '10to20L': 2000000,
  above20L: Infinity,
};

// ─── Scoring functions (deterministic, no randomness) ────────────────────────

function scoreBudget(price, budgetKey) {
  const limit = BUDGET_LIMITS[budgetKey];
  if (limit === Infinity) return 30;       // above20L: any price qualifies
  if (price <= limit) return 30;           // within budget: full points
  if (price <= limit * 1.1) return 15;     // up to 10% over: half points
  return 0;
}

function scoreSafety(safetyRating) {
  // safetyRating is 1–5 NCAP stars → scaled to 30
  return Math.round((safetyRating / 5) * 30);
}

function scoreMileage(mileageStr) {
  const value = parseFloat(mileageStr);
  const isEV = mileageStr.includes('km/charge');

  if (isEV) {
    // EV range in km/charge
    if (value >= 500) return 25;
    if (value >= 400) return 21;
    if (value >= 300) return 17;
    if (value >= 200) return 12;
    return 8;
  }

  // ICE / Hybrid in kmpl
  if (value >= 25) return 25;
  if (value >= 22) return 21;
  if (value >= 18) return 16;
  if (value >= 14) return 11;
  return 6;
}

function scoreFamilyFriendly(carFamilyFriendly, familySizeKey) {
  const needsFamily = familySizeKey === 'small' || familySizeKey === 'large';

  if (needsFamily) {
    // families need space: reward or hard-penalise
    return carFamilyFriendly ? 15 : 0;
  }

  // solo / couple: compact / sporty cars are perfectly fine
  return carFamilyFriendly ? 10 : 15;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function getRecommendations(answers) {
  const { budget, familySize } = answers;

  const scored = cars.map((car) => {
    const budgetScore        = scoreBudget(car.price, budget);
    const safetyScore        = scoreSafety(car.safetyRating);
    const mileageScore       = scoreMileage(car.mileage);
    const familyScore        = scoreFamilyFriendly(car.familyFriendly, familySize);
    const total              = budgetScore + safetyScore + mileageScore + familyScore;

    return {
      car,
      score: total,
      breakdown: {
        budget:        budgetScore,
        safety:        safetyScore,
        mileage:       mileageScore,
        familyFriendly: familyScore,
      },
    };
  });

  const ranked = scored
    .sort((a, b) => b.score - a.score)
    .map((entry, i) => ({ rank: i + 1, ...entry }));

  return {
    recommendations: ranked.slice(0, 3),
    totalCarsScored: cars.length,
    answers,
  };
}
